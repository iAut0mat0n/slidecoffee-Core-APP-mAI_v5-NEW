import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs/promises'
import { spawn } from 'child_process'
import { createClient } from '@supabase/supabase-js'

const router = Router()

// Configure multer for PPTX file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'pptx')
    await fs.mkdir(uploadDir, { recursive: true })
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + '.pptx')
  }
})

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      cb(null, true)
    } else {
      cb(new Error('Only .pptx files are allowed'))
    }
  },
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB limit
  }
})

// Helper to run Python extraction script
function extractThemeFromPPTX(filePath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), 'server', 'utils', 'extract_pptx_theme.py')
    const python = spawn('python3', [scriptPath, filePath])
    
    let stdout = ''
    let stderr = ''
    
    python.stdout.on('data', (data) => {
      stdout += data.toString()
    })
    
    python.stderr.on('data', (data) => {
      stderr += data.toString()
    })
    
    python.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python script exited with code ${code}: ${stderr}`))
        return
      }
      
      try {
        const result = JSON.parse(stdout)
        resolve(result)
      } catch (error) {
        reject(new Error(`Failed to parse Python output: ${error instanceof Error ? error.message : 'Unknown error'}`))
      }
    })
    
    python.on('error', (error) => {
      reject(new Error(`Failed to spawn Python process: ${error.message}`))
    })
  })
}

/**
 * POST /api/themes/import-pptx
 * 
 * Upload a PowerPoint file and extract theme information
 * 
 * Request:
 *   - multipart/form-data with 'pptx' file field
 *   - Auth: Bearer token required
 * 
 * Response:
 *   - 200: { success: true, theme: <extracted_theme_data> }
 *   - 400: { error: 'Invalid file' }
 *   - 500: { error: 'Extraction failed' }
 */
router.post('/import-pptx', upload.single('pptx'), async (req, res) => {
  try {
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    )
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }
    
    const filePath = req.file.path
    
    try {
      // Extract theme using Python script
      const themeData = await extractThemeFromPPTX(filePath)
      
      if (!themeData.success) {
        return res.status(400).json({ 
          error: 'Failed to extract theme', 
          details: themeData.error 
        })
      }
      
      // Clean up uploaded file
      await fs.unlink(filePath).catch(() => {})
      
      // Format response
      const response = {
        success: true,
        theme: {
          name: themeData.filename.replace('.pptx', ''),
          colors: {
            primary: themeData.colors.primary,
            secondary: themeData.colors.secondary,
            accent: themeData.colors.accent,
            palette: themeData.colors.palette
          },
          fonts: {
            heading: themeData.fonts.heading,
            body: themeData.fonts.body,
            all_fonts: themeData.fonts.fonts_used
          },
          metadata: {
            total_slides: themeData.total_slides,
            total_images: themeData.images.total_images,
            has_logo: themeData.images.logo_image !== null,
            slide_dimensions: themeData.slide_dimensions,
            layouts: themeData.slide_layouts,
            core_properties: themeData.metadata.core_properties
          },
          extracted_raw: themeData
        }
      }
      
      return res.json(response)
      
    } catch (extractionError) {
      // Clean up file on error
      await fs.unlink(filePath).catch(() => {})
      throw extractionError
    }
    
  } catch (error) {
    console.error('PPTX import error:', error)
    return res.status(500).json({ 
      error: 'Failed to process PowerPoint file',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * POST /api/themes
 * 
 * Save a theme to the database
 * 
 * Request:
 *   - JSON body with theme data
 *   - Auth: Bearer token required
 * 
 * Response:
 *   - 200: { success: true, theme: <saved_theme> }
 *   - 400: { error: 'Invalid data' }
 *   - 500: { error: 'Save failed' }
 */
router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    )
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    const { name, colors, fonts, metadata, extractedMetadata } = req.body
    
    if (!name || !colors || !fonts) {
      return res.status(400).json({ error: 'Missing required fields: name, colors, fonts' })
    }
    
    // TODO: Get user's workspace ID (for now using first workspace)
    // In production, this should come from the request or user context
    const { data: workspaces } = await supabase
      .from('v2_workspaces')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1)
    
    if (!workspaces || workspaces.length === 0) {
      return res.status(400).json({ error: 'No workspace found for user' })
    }
    
    const workspaceId = workspaces[0].id
    
    // Insert theme into database
    const { data: theme, error: insertError } = await supabase
      .from('v2_theme_profiles')
      .insert({
        workspace_id: workspaceId,
        created_by: user.id,
        name: name,
        description: `Imported PowerPoint theme: ${metadata?.total_slides || 0} slides`,
        source_type: 'pptx',
        created_via: 'pptx_import',
        palette_json: {
          primary: colors.primary,
          secondary: colors.secondary,
          accent: colors.accent,
          palette: colors.palette || []
        },
        typography_json: {
          heading: fonts.heading,
          body: fonts.body,
          fonts_used: fonts.all_fonts || []
        },
        extracted_metadata: extractedMetadata || metadata || {},
        is_public: false,
        is_featured: false
      })
      .select()
      .single()
    
    if (insertError) {
      console.error('Theme insert error:', insertError)
      return res.status(500).json({ error: 'Failed to save theme', details: insertError.message })
    }
    
    return res.json({ success: true, theme })
    
  } catch (error) {
    console.error('Theme save error:', error)
    return res.status(500).json({ 
      error: 'Failed to save theme',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router
