import { DISCORD_OAUTH_URL, DISCORD_CLIENT_ID, MINT_FOREST_URL, DISCORD_SCOPES, REDIRECT_URL } from '../const/oauth';

class DiscordService {
  private generateAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      redirect_uri: MINT_FOREST_URL,
      response_type: 'code',
      scope: DISCORD_SCOPES.join(' '),
    });
    return `${DISCORD_OAUTH_URL}?${params.toString()}`;
  }

  startOAuth(): Promise<{ success: boolean; data?: { code: string }; error?: string }> {
    return new Promise((resolve) => {
      try {
        const authWindow = window.open(this.generateAuthUrl(), '_blank');

        if (!authWindow) {
          window.location.href = this.generateAuthUrl();
          return;
        }

        const checkClosed = setInterval(() => {
          try {
            if (authWindow.closed) {
              clearInterval(checkClosed);
              resolve({ success: false, error: 'Auth window closed by user' });
            }
          } catch (e: any) {
            clearInterval(checkClosed);
            resolve({ success: false, error: `Failed to check window state: ${e.message}` });
          }
        }, 500);

        const checkRedirect = setInterval(() => {
          try {
            if (authWindow.location.href.includes(REDIRECT_URL)) {
              const urlParams = new URLSearchParams(authWindow.location.search);
              const code = urlParams.get('code');
              const error = urlParams.get('error');

              clearInterval(checkRedirect);
              authWindow.close();

              if (error) {
                resolve({ success: false, error: error || 'Discord authorization failed' });
              } else if (code) {
                resolve({ success: true, data: { code } });
              } else {
                resolve({ success: false, error: 'No code returned from Discord' });
              }
            }
          } catch (e) {
            if (authWindow.closed) {
              clearInterval(checkRedirect);
              resolve({ success: false, error: 'Auth window closed unexpectedly' });
            }
          }
        }, 500);
      } catch (e: any) {
        resolve({ success: false, error: `Failed to start Discord OAuth: ${e.message}` });
      }
    });
  }
}

export const discordService = new DiscordService();
