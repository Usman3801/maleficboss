"use client";

/**
 * OAuth Integration for Social Platforms
 * Handles authentication with Twitter/X, Discord, Telegram, and GitHub
 */

export interface OAuthConfig {
  clientId: string;
  redirectUri: string;
  scope: string[];
}

export interface SocialConnection {
  platform: "twitter" | "discord" | "telegram" | "github";
  connected: boolean;
  username: string;
  userId?: string;
  accessToken?: string;
  profileUrl?: string;
  avatar?: string;
}

// OAuth Configuration
// NOTE: These should be stored in environment variables in production
// For development/testing, you can hardcode the values here temporarily
const OAUTH_CONFIGS = {
  twitter: {
    clientId: process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID || "YOUR_TWITTER_CLIENT_ID_HERE",
    authUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    scope: ["tweet.read", "users.read", "offline.access"],
  },
  discord: {
    clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || "1454973206501916916",
    authUrl: "https://discord.com/api/oauth2/authorize",
    tokenUrl: "https://discord.com/api/oauth2/token",
    scope: ["identify", "email"],
  },
  telegram: {
    botToken: process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || "YOUR_TELEGRAM_BOT_TOKEN_HERE",
    authUrl: "https://oauth.telegram.org/auth",
  },
  github: {
    clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || "Ov23lipSJORyT9WRif6u",
    authUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    scope: ["read:user"],
  },
};

/**
 * Generate OAuth authorization URL
 */
export function getAuthorizationUrl(
  platform: "twitter" | "discord" | "github",
  state: string
): string {
  const config = OAUTH_CONFIGS[platform];
  const redirectUri = `${window.location.origin}/oauth/callback`;

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: config.scope.join(" "),
    state: state,
  });

  // Twitter OAuth 2.0 specific parameters
  if (platform === "twitter") {
    params.append("code_challenge", "challenge");
    params.append("code_challenge_method", "plain");
  }

  return `${config.authUrl}?${params.toString()}`;
}

/**
 * Check if OAuth credentials are configured
 */
function checkOAuthConfig(platform: "twitter" | "discord" | "github"): boolean {
  const config = OAUTH_CONFIGS[platform];
  const hasValidId = config.clientId &&
    !config.clientId.includes("YOUR_") &&
    config.clientId.length > 10;

  if (!hasValidId) {
    throw new Error(
      `${platform.toUpperCase()} OAuth is not configured.\n\n` +
      `Please set up your OAuth app and add the Client ID:\n` +
      `1. Create an OAuth app on ${platform}\n` +
      `2. Add the Client ID to .env.local as NEXT_PUBLIC_${platform.toUpperCase()}_CLIENT_ID\n` +
      `3. Or update lib/oauth.ts with your Client ID\n\n` +
      `See OAUTH_SETUP.md for detailed instructions.`
    );
  }

  return true;
}

/**
 * Initialize OAuth flow for a platform
 */
export async function initiateOAuth(
  platform: "twitter" | "discord" | "github"
): Promise<void> {
  try {
    // Check if OAuth is configured
    checkOAuthConfig(platform);

    // Generate random state for CSRF protection
    const state = Math.random().toString(36).substring(7);
    sessionStorage.setItem("oauth_state", state);
    sessionStorage.setItem("oauth_platform", platform);

    // Get authorization URL
    const authUrl = getAuthorizationUrl(platform, state);

    // Open OAuth popup
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      authUrl,
      `${platform}_oauth`,
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (!popup) {
      throw new Error("Popup blocked. Please allow popups for this site.");
    }

    // Listen for OAuth callback
    return new Promise((resolve, reject) => {
      const checkPopup = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopup);
          const connection = getStoredConnection(platform);
          if (connection?.connected) {
            resolve();
          } else {
            reject(new Error("OAuth flow cancelled"));
          }
        }
      }, 500);
    });
  } catch (error) {
    console.error(`Failed to initiate ${platform} OAuth:`, error);
    throw error;
  }
}

/**
 * Handle OAuth callback and exchange code for token
 */
export async function handleOAuthCallback(
  code: string,
  state: string,
  platform: "twitter" | "discord" | "github"
): Promise<SocialConnection> {
  // Verify state matches
  const storedState = sessionStorage.getItem("oauth_state");
  if (state !== storedState) {
    throw new Error("Invalid OAuth state");
  }

  try {
    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code, platform);

    // Get user profile
    const profile = await getUserProfile(tokenData.access_token, platform);

    // Create connection object
    const connection: SocialConnection = {
      platform,
      connected: true,
      username: profile.username,
      userId: profile.id,
      accessToken: tokenData.access_token,
      profileUrl: profile.url,
      avatar: profile.avatar,
    };

    // Store connection
    storeConnection(connection);

    // Clean up session storage
    sessionStorage.removeItem("oauth_state");
    sessionStorage.removeItem("oauth_platform");

    return connection;
  } catch (error) {
    console.error(`OAuth callback failed for ${platform}:`, error);
    throw error;
  }
}

/**
 * Exchange authorization code for access token
 */
async function exchangeCodeForToken(
  code: string,
  platform: "twitter" | "discord" | "github"
): Promise<{ access_token: string; refresh_token?: string }> {
  const config = OAUTH_CONFIGS[platform];
  const redirectUri = `${window.location.origin}/oauth/callback`;

  const body = new URLSearchParams({
    client_id: config.clientId,
    code: code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });

  // For production, this should be done server-side to protect client secret
  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get user profile from platform API
 */
async function getUserProfile(
  accessToken: string,
  platform: "twitter" | "discord" | "github"
): Promise<{ id: string; username: string; url: string; avatar?: string }> {
  let apiUrl: string;
  let headers: HeadersInit = {
    Authorization: `Bearer ${accessToken}`,
  };

  switch (platform) {
    case "twitter":
      apiUrl = "https://api.twitter.com/2/users/me";
      break;
    case "discord":
      apiUrl = "https://discord.com/api/users/@me";
      break;
    case "github":
      apiUrl = "https://api.github.com/user";
      break;
    default:
      throw new Error(`Unknown platform: ${platform}`);
  }

  const response = await fetch(apiUrl, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch profile: ${response.statusText}`);
  }

  const data = await response.json();

  // Map platform-specific response to common format
  switch (platform) {
    case "twitter":
      return {
        id: data.data.id,
        username: data.data.username,
        url: `https://twitter.com/${data.data.username}`,
        avatar: data.data.profile_image_url,
      };
    case "discord":
      return {
        id: data.id,
        username: `${data.username}#${data.discriminator}`,
        url: `https://discord.com/users/${data.id}`,
        avatar: data.avatar
          ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`
          : undefined,
      };
    case "github":
      return {
        id: data.id.toString(),
        username: data.login,
        url: data.html_url,
        avatar: data.avatar_url,
      };
    default:
      throw new Error(`Unknown platform: ${platform}`);
  }
}

/**
 * Telegram OAuth (uses Telegram Login Widget)
 */
export function initiateTelegramAuth(): void {
  const botToken = OAUTH_CONFIGS.telegram.botToken;

  // Check if bot token is configured
  if (!botToken || botToken.includes("YOUR_")) {
    throw new Error(
      "Telegram OAuth is not configured.\n\n" +
      "Please set up your Telegram bot:\n" +
      "1. Create a bot via @BotFather on Telegram\n" +
      "2. Get your bot token\n" +
      "3. Add it to .env.local as NEXT_PUBLIC_TELEGRAM_BOT_TOKEN\n" +
      "4. Or update lib/oauth.ts with your bot token\n\n" +
      "See OAUTH_SETUP.md for detailed instructions."
    );
  }

  // Telegram uses a different OAuth flow via Login Widget
  // This would typically be implemented with a backend endpoint
  const authUrl = `https://oauth.telegram.org/auth?bot_id=${botToken}&origin=${window.location.origin}&return_to=${window.location.href}`;

  window.open(authUrl, "_blank", "width=600,height=700");
}

/**
 * Store social connection in localStorage
 */
export function storeConnection(connection: SocialConnection): void {
  const connections = getAllConnections();
  connections[connection.platform] = connection;
  localStorage.setItem("social_connections", JSON.stringify(connections));
}

/**
 * Get stored connection for a platform
 */
export function getStoredConnection(
  platform: "twitter" | "discord" | "telegram" | "github"
): SocialConnection | null {
  const connections = getAllConnections();
  return connections[platform] || null;
}

/**
 * Get all stored connections
 */
export function getAllConnections(): Record<string, SocialConnection> {
  const stored = localStorage.getItem("social_connections");
  return stored ? JSON.parse(stored) : {};
}

/**
 * Disconnect a social platform
 */
export function disconnectPlatform(
  platform: "twitter" | "discord" | "telegram" | "github"
): void {
  const connections = getAllConnections();
  delete connections[platform];
  localStorage.setItem("social_connections", JSON.stringify(connections));
}

/**
 * Clear all social connections
 */
export function clearAllConnections(): void {
  localStorage.removeItem("social_connections");
}
