import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee } from 'lucide-react';

export default function OnboardingNew() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  // Step 1: Tell us about yourself
  const [role, setRole] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [useCase, setUseCase] = useState('');
  
  // Step 2: Create workspace
  const [workspaceName, setWorkspaceName] = useState('');
  
  // Step 3: Create brand
  const [brandName, setBrandName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#7C3AED');
  const [secondaryColor, setSecondaryColor] = useState('#3B82F6');
  
  const handleStep1Continue = () => {
    if (role && companySize && useCase) {
      setStep(2);
    }
  };
  
  const handleStep2Continue = () => {
    if (workspaceName) {
      setStep(3);
    }
  };
  
  const handleStep3Continue = () => {
    if (brandName) {
      setStep(4);
    }
  };
  
  const handleStep4Continue = (mode: string) => {
    // Navigate to creation flow
    navigate(`/create/${mode}`);
  };
  
  const progressPercentage = (step / 4) * 100;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header with logo and progress */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <Coffee className="w-8 h-8 text-purple-600" />
            <h1 className="text-xl font-bold">SlideCoffee</h1>
          </div>
          
          {/* Progress bar */}
          <div className="flex items-center gap-2 flex-1 max-w-md ml-12">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex-1 h-2 bg-gray-300 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    s <= step ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                  style={{ width: s <= step ? '100%' : '0%' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Step 1: Tell us about yourself */}
          {step === 1 && (
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold mb-3">Tell us about yourself</h2>
                <p className="text-gray-600 text-lg">Help us personalize your experience</p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    <option value="founder">Founder / CEO</option>
                    <option value="marketing">Marketing</option>
                    <option value="sales">Sales</option>
                    <option value="product">Product Manager</option>
                    <option value="designer">Designer</option>
                    <option value="consultant">Consultant</option>
                    <option value="student">Student</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company size
                  </label>
                  <select
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    <option value="solo">Just me</option>
                    <option value="2-10">2-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-1000">201-1,000 employees</option>
                    <option value="1000+">1,000+ employees</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary use case
                  </label>
                  <select
                    value={useCase}
                    onChange={(e) => setUseCase(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    <option value="pitch">Pitch decks</option>
                    <option value="sales">Sales presentations</option>
                    <option value="marketing">Marketing materials</option>
                    <option value="reports">Business reports</option>
                    <option value="education">Education / Training</option>
                    <option value="internal">Internal communications</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <button
                onClick={handleStep1Continue}
                disabled={!role || !companySize || !useCase}
                className="w-full mt-8 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Continue
              </button>
            </div>
          )}
          
          {/* Step 2: Create workspace */}
          {step === 2 && (
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold mb-3">Create your workspace</h2>
                <p className="text-gray-600 text-lg">A workspace helps you organize your presentations</p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Workspace name
                  </label>
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., My Company, Personal, Acme Inc"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    You can create multiple workspaces later
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleStep2Continue}
                  disabled={!workspaceName}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}
          
          {/* Step 3: Create brand */}
          {step === 3 && (
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold mb-3">Create your first brand</h2>
                <p className="text-gray-600 text-lg">Define your brand identity for consistent presentations</p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand name
                  </label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Acme Inc, Personal Brand"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-16 h-12 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-16 h-12 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-500">
                  You can add logos, fonts, and more brand assets later
                </p>
              </div>
              
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleStep3Continue}
                  disabled={!brandName}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}
          
          {/* Step 4: Choose creation mode */}
          {step === 4 && (
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold mb-3">How would you like to create?</h2>
                <p className="text-gray-600 text-lg">Choose your preferred creation method</p>
              </div>
              
              <div className="grid gap-4">
                {/* Generate with AI */}
                <button
                  onClick={() => handleStep4Continue('generate')}
                  className="p-6 border-2 border-gray-200 hover:border-purple-500 rounded-xl text-left transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                      <span className="text-2xl group-hover:text-white">✨</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">Generate with AI</h3>
                      <p className="text-gray-600">
                        Describe your presentation and let our AI create it for you
                      </p>
                    </div>
                  </div>
                </button>
                
                {/* Paste content */}
                <button
                  onClick={() => handleStep4Continue('paste')}
                  className="p-6 border-2 border-gray-200 hover:border-purple-500 rounded-xl text-left transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                      <span className="text-2xl group-hover:text-white">📋</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">Paste content</h3>
                      <p className="text-gray-600">
                        Paste your existing content and we'll format it beautifully
                      </p>
                    </div>
                  </div>
                </button>
                
                {/* Import file */}
                <button
                  onClick={() => handleStep4Continue('import')}
                  className="p-6 border-2 border-gray-200 hover:border-purple-500 rounded-xl text-left transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-600 transition-colors">
                      <span className="text-2xl group-hover:text-white">📁</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">Import file</h3>
                      <p className="text-gray-600">
                        Upload your PowerPoint, PDF, or Google Slides
                      </p>
                    </div>
                  </div>
                </button>
              </div>
              
              <button
                onClick={() => setStep(3)}
                className="w-full mt-6 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

