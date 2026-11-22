const TOKEN_KEY = 'dormhub_token';
const USER_KEY = 'dormhub_user';

// Явный список ролей с правами администрации
const ADMIN_ROLES = new Set(['ADMIN', 'COMMANDANT', 'MANAGER']);

/**
 * Проверка, не истек ли срок жизни JWT-токена
 */
function isTokenExpired(token) {
    try {
        const payloadBase64 = token.split('.')[1];
        if (!payloadBase64) return false; // Если токен не JWT (например, обычный UUID)
        
        // Корректное декодирование Base64Url
        const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        
        if (!payload.exp) return false;
        // Проверяем с запасом в 10 секунд на рассинхрон часов
        return Date.now() >= (payload.exp * 1000) - 10000;
    } catch {
        return true; // Битый токен считаем истекшим
    }
}

export const auth = {
    get token() {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) return null;

        if (isTokenExpired(token)) {
            this.logout();
            return null;
        }
        return token;
    },

    set token(v) {
        if (v) localStorage.setItem(TOKEN_KEY, v);
        else localStorage.removeItem(TOKEN_KEY);
    },

    get user() {
        // Если токен истек, данные пользователя тоже недействительны
        if (!this.token) return null;
        try {
            return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
        } catch {
            return null;
        }
    },

    set user(v) {
        if (v) localStorage.setItem(USER_KEY, JSON.stringify(v));
        else localStorage.removeItem(USER_KEY);
    },

    /**
     * Удобный метод для атомарного входа в систему
     */
    login(token, user) {
        this.token = token;
        this.user = user;
    },

    isLoggedIn() {
        return Boolean(this.token && this.user);
    },

    isAdmin() {
        return Boolean(this.user && ADMIN_ROLES.has(this.user.role));
    },

    logout() {
        this.token = null;
        this.user = null;
    },
};

// Синхронизация выхода/входа между открытыми вкладками браузера
window.addEventListener('storage', (e) => {
    if (e.key === TOKEN_KEY && !e.newValue) {
        location.hash = '#/login';
    }
});
