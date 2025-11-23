/**
 * 🔔 COLLABORATION: @Mentions Parser and Notification System
 */

import { getServiceRoleClient } from './supabase-auth.js';

export interface MentionedUser {
  username: string;
  userId?: string;
  email?: string;
}

/**
 * Parse @mentions from comment text
 * Supports @username and @email formats
 */
export function parseMentions(text: string): MentionedUser[] {
  const mentions: MentionedUser[] = [];
  
  // Match @username (letters, numbers, underscores, hyphens)
  const usernamePattern = /@([\w-]+)/g;
  let match;
  
  while ((match = usernamePattern.exec(text)) !== null) {
    const username = match[1];
    mentions.push({ username });
  }
  
  // Match @email (standard email format)
  const emailPattern = /@([\w.-]+@[\w.-]+\.\w+)/g;
  while ((match = emailPattern.exec(text)) !== null) {
    const email = match[1];
    mentions.push({ username: email, email });
  }
  
  // Remove duplicates
  const uniqueMentions = mentions.filter((mention, index, self) =>
    index === self.findIndex((m) => m.username === mention.username)
  );
  
  return uniqueMentions;
}

/**
 * Resolve @mentions to actual user IDs from workspace
 */
export async function resolveMentions(
  mentions: MentionedUser[],
  workspaceId: string
): Promise<MentionedUser[]> {
  if (mentions.length === 0) return [];
  
  const supabase = getServiceRoleClient();
  
  // Get all workspace members
  const { data: members } = await supabase
    .from('v2_workspace_members')
    .select('user_id, users:v2_users(id, email, name)')
    .eq('workspace_id', workspaceId);
  
  if (!members) return mentions;
  
  // Match mentions to users
  const resolvedMentions = mentions.map(mention => {
    const matchedMember = members.find((member: any) => {
      const user = member.users;
      if (!user) return false;
      
      // Match by email
      if (mention.email && user.email === mention.email) {
        return true;
      }
      
      // Match by name (case-insensitive)
      if (user.name && user.name.toLowerCase().includes(mention.username.toLowerCase())) {
        return true;
      }
      
      // Match by email username (part before @)
      if (user.email && user.email.split('@')[0].toLowerCase() === mention.username.toLowerCase()) {
        return true;
      }
      
      return false;
    });
    
    if (matchedMember) {
      const user = (matchedMember as any).users;
      return {
        ...mention,
        userId: user.id,
        email: user.email
      };
    }
    
    return mention;
  });
  
  return resolvedMentions.filter(m => m.userId); // Only return resolved mentions
}

/**
 * Create notifications for @mentioned users
 */
export async function createMentionNotifications(
  mentionedUsers: MentionedUser[],
  workspaceId: string,
  presentationId: string,
  presentationTitle: string,
  slideIndex: number,
  commentContent: string,
  authorName: string
): Promise<void> {
  if (mentionedUsers.length === 0) return;
  
  const supabase = getServiceRoleClient();
  
  const notifications = mentionedUsers
    .filter(user => user.userId)
    .map(user => ({
      workspace_id: workspaceId,
      user_id: user.userId!,
      type: 'mention',
      title: `${authorName} mentioned you`,
      message: `${authorName} mentioned you in a comment on "${presentationTitle}"`,
      link: `/presentation/${presentationId}?slide=${slideIndex}`,
      metadata: {
        presentation_id: presentationId,
        presentation_title: presentationTitle,
        slide_index: slideIndex,
        comment_preview: commentContent.slice(0, 100),
        author_name: authorName
      }
    }));
  
  if (notifications.length > 0) {
    await supabase.from('v2_notifications').insert(notifications);
    console.log(`✉️ Created ${notifications.length} mention notifications`);
  }
}

/**
 * Create notification for comment reply
 */
export async function createReplyNotification(
  parentCommentAuthorId: string,
  workspaceId: string,
  presentationId: string,
  presentationTitle: string,
  slideIndex: number,
  replyContent: string,
  authorName: string
): Promise<void> {
  const supabase = getServiceRoleClient();
  
  await supabase.from('v2_notifications').insert({
    workspace_id: workspaceId,
    user_id: parentCommentAuthorId,
    type: 'reply',
    title: `${authorName} replied to your comment`,
    message: `${authorName} replied to your comment on "${presentationTitle}"`,
    link: `/presentation/${presentationId}?slide=${slideIndex}`,
    metadata: {
      presentation_id: presentationId,
      presentation_title: presentationTitle,
      slide_index: slideIndex,
      reply_preview: replyContent.slice(0, 100),
      author_name: authorName
    }
  });
  
  console.log(`✉️ Created reply notification for user ${parentCommentAuthorId}`);
}
