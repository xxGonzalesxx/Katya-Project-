import { api } from '../api.js';
import { auth } from '../auth.js';
import { alert } from '../ui.js';
import { renderNavbar } from '../app.js';

export function renderLogin(container) {
    // 1. Если пользователь уже авторизован — сразу отправляем на главную
    if (auth.isLoggedIn()) {
        location.hash = '#/home';
        return;
    }

    // 2. Верстка центрированной стеклянной карточки в стиле 2026
    container.innerHTML = `
        <div class="row justify-content-center align-items-center" style="min-height: 75vh;">
            <div class="col-12 col-sm-10 col-md-7 col-lg-5 col-xl-4">
                <div class="card p-4 p-md-5 border-0 shadow-sm">
                    <div class="text-center mb-4">
                        <div class="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-4 fw-bold fs-4 mb-3 shadow-sm" style="width: 52px; height: 52px;">
                            DH
                        </div>
                        <h3 class="fw-bold text-dark mb-1" style="letter-spacing: -0.02em;">Вход в DormHub</h3>
                        <p class="text-muted-sm mb-0">Введите данные вашего студенческого аккаунта</p>
                    </div>

                    <!-- Контейнер для вывода ошибок авторизации -->
                    <div id="login-alert"></div>

                    <form id="login-form" novalidate>
                        <div class="mb-3">
                            <label for="login-email" class="form-label">Электронная почта</label>
                            <input 
                                type="email" 
                                class="form-control" 
                                id="login-email" 
                                name="email"
                                placeholder="student@university.ru" 
                                autocomplete="email"
                                required
                            >
                        </div>

                        <div class="mb-4">
                            <div class="d-flex justify-content-between align-items-center">
                                <label for="login-password" class="form-label mb-1">Пароль</label>
                            </div>
                            <div class="input-group">
                                <input 
                                    type="password" 
                                    class="form-control border-end-0" 
                                    id="login-password" 
                                    name="password"
                                    placeholder="••••••••" 
                                    autocomplete="current-password"
                                    required
                                >
                                <button 
                                    class="btn btn-outline-secondary border-start-0 bg-white text-muted" 
                                    type="button" 
                                    id="toggle-password"
                                    aria-label="Показать пароль"
                                    style="border-color: rgba(15, 23, 42, 0.12);"
                                >
                                    👁️
                                </button>
                            </div>
                        </div>

                        <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold" id="login-submit">
                            Войти в систему
                        </button>
                    </form>
                </div>

                <div class="text-center mt-4">
                    <a href="#/home" class="text-muted-sm text-decoration-none">&larr; Вернуться на главную</a>
                </div>
            </div>
        </div>
    `;

    const form = document.getElementById('login-form');
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const toggleBtn = document.getElementById('toggle-password');
    const submitBtn = document.getElementById('login-submit');
    const alertBox = document.getElementById('login-alert');

    // Фокус на поле email для быстрого ввода с клавиатуры
    emailInput.focus();

    // 3. Переключение видимости пароля
    toggleBtn.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        toggleBtn.textContent = isPassword ? '🙈' : '👁️';
    });

    // 4. Обработка отправки формы
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        alertBox.innerHTML = '';

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            alertBox.innerHTML = alert('warning', 'Пожалуйста, заполните email и пароль');
            return;
        }

        // Блокируем кнопку от двойных кликов
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Входим...
        `;

        try {
            // Отправляем запрос на бэкенд (ожидаем { token, user })
            const res = await api.post('/auth/login', { email, password });

            // Сохраняем сессию (поддержка разных форматов ответа бэкенда)
            const token = res.token || res.accessToken;
            const user = res.user || { email, role: res.role || 'STUDENT' };

            if (!token) {
                throw new Error('Сервер не вернул токен авторизации');
            }

            auth.login(token, user);
            renderNavbar(); // Мгновенно обновляем шапку без перезагрузки страницы
            location.hash = '#/home';
        } catch (err) {
            alertBox.innerHTML = alert('danger', err.message || 'Неверный email или пароль');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            passwordInput.value = '';
            passwordInput.focus();
        }
    });
}
