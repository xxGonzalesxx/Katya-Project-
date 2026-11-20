export function renderHome(container) {
    container.innerHTML = `
        <div class="d-flex gap-2 justify-content-center">
            <a href="#/news"  class="btn btn-primary btn-lg">Новости</a>
            <a href="#/rules" class="btn btn-secondary btn-lg">Правила</a>
            <a href="#/login" class="btn btn-success btn-lg">Вход / Регистрация</a>
        </div>
    `;
}