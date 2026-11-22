import { api } from '../api.js';
import { auth } from '../auth.js';
import { escapeHtml, skeletonCards, alert, emptyState } from '../ui.js';

export function renderNews(container) {
    const isAdmin = auth.isAdmin();
    const controller = new AbortController();
    let allNews = [];

    // 1. Базовая разметка страницы новостей
    container.innerHTML = `
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
            <div>
                <h2 class="page-title mb-1">Новости общежития</h2>
                <p class="text-muted-sm mb-0">Важные объявления, графики работ и события кампуса</p>
            </div>
            
            <div class="d-flex gap-2">
                <input 
                    type="search" 
                    id="news-search" 
                    class="form-control" 
                    placeholder="Поиск по новостям..." 
                    aria-label="Поиск по новостям"
                    style="min-width: 220px;"
                >
                ${isAdmin ? `
                    <button class="btn btn-primary text-nowrap fw-medium" data-bs-toggle="modal" data-bs-target="#createNewsModal">
                        + Добавить
                    </button>
                ` : ''}
            </div>
        </div>

        <div id="news-alert"></div>
        <div id="news-list">${skeletonCards(3)}</div>

        ${isAdmin ? renderCreateModal() : ''}
    `;

    const listEl = document.getElementById('news-list');
    const alertEl = document.getElementById('news-alert');
    const searchInput = document.getElementById('news-search');

    // 2. Загрузка новостей с сервера
    async function loadNews() {
        try {
            const res = await api.get('/news', { signal: controller.signal });
            // Поддержка ответа как в виде массива, так и в виде объекта { items / data }
            allNews = Array.isArray(res) ? res : (res?.items || res?.data || []);
            renderList(allNews);
        } catch (err) {
            if (err.name === 'AbortError') return;
            listEl.innerHTML = emptyState('Не удалось загрузить новости. Попробуйте обновить страницу.');
            alertEl.innerHTML = alert('danger', err.message);
        }
    }

    // 3. Отрисовка списка карточек
    function renderList(items) {
        if (!items.length) {
            const query = searchInput.value.trim();
            listEl.innerHTML = query
                ? emptyState(`По запросу «${query}» ничего не найдено`)
                : emptyState('Пока нет ни одной новости');
            return;
        }

        listEl.innerHTML = `
            <div class="row g-3 g-md-4">
                ${items.map(item => {
                    const id = item.id ?? item._id;
                    const text = item.content || item.text || item.body || '';
                    const dateStr = item.createdAt || item.date
                        ? new Date(item.createdAt || item.date).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })
                        : '';

                    return `
                        <div class="col-12" data-news-id="${escapeHtml(id)}">
                            <article class="card p-3 p-md-4">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-start gap-3 mb-2">
                                        <h5 class="card-title fw-bold mb-0">${escapeHtml(item.title)}</h5>
                                        <div class="d-flex align-items-center gap-2 flex-shrink-0">
                                            ${dateStr ? `<span class="badge bg-light text-secondary border fw-normal">${escapeHtml(dateStr)}</span>` : ''}
                                            ${isAdmin && id ? `
                                                <button 
                                                    class="btn btn-outline-danger btn-sm border-0 px-2 delete-news-btn" 
                                                    data-id="${escapeHtml(id)}" 
                                                    title="Удалить новость"
                                                    aria-label="Удалить новость"
                                                >
                                                    🗑️
                                                </button>
                                            ` : ''}
                                        </div>
                                    </div>
                                    <p class="card-text text-secondary mb-0" style="white-space: pre-line;">${escapeHtml(text)}</p>
                                </div>
                            </article>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    // 4. Живой поиск по загруженным новостям
    searchInput.addEventListener('input', () => {
        const q = searchInput.value.trim().toLowerCase();
        if (!q) {
            renderList(allNews);
            return;
        }
        const filtered = allNews.filter(item => {
            const title = (item.title || '').toLowerCase();
            const body = (item.content || item.text || item.body || '').toLowerCase();
            return title.includes(q) || body.includes(q);
        });
        renderList(filtered);
    });

    // 5. Логика создания и удаления новости (только для админа/коменданта)
    if (isAdmin) {
        setupAdminActions(container, alertEl, () => loadNews());
    }

    loadNews();

    // Возвращаем функцию очистки для router.js (отменит fetch при уходе со страницы)
    return () => controller.abort();
}

/**
 * Модальное окно создания новости для администратора
 */
function renderCreateModal() {
    return `
        <div class="modal fade" id="createNewsModal" tabindex="-1" aria-labelledby="createNewsLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow" style="border-radius: var(--radius-lg);">
                    <div class="modal-header border-bottom-0 pb-0">
                        <h5 class="modal-title fw-bold" id="createNewsLabel">Новая публикация</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button>
                    </div>
                    <form id="create-news-form">
                        <div class="modal-body">
                            <div id="modal-news-alert"></div>
                            <div class="mb-3">
                                <label for="news-title" class="form-label">Заголовок</label>
                                <input type="text" class="form-control" id="news-title" placeholder="Например: Отключение горячей воды" required>
                            </div>
                            <div class="mb-2">
                                <label for="news-content" class="form-label">Текст объявления</label>
                                <textarea class="form-control" id="news-content" rows="4" placeholder="Подробности для жильцов..." required></textarea>
                            </div>
                        </div>
                        <div class="modal-footer border-top-0 pt-0">
                            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Отмена</button>
                            <button type="submit" class="btn btn-primary px-4" id="submit-news-btn">Опубликовать</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

/**
 * Обработчики создания и удаления новостей
 */
function setupAdminActions(container, alertEl, onSuccess) {
    const form = document.getElementById('create-news-form');
    const modalEl = document.getElementById('createNewsModal');
    const submitBtn = document.getElementById('submit-news-btn');
    const modalAlert = document.getElementById('modal-news-alert');

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        modalAlert.innerHTML = '';

        const title = document.getElementById('news-title').value.trim();
        const content = document.getElementById('news-content').value.trim();

        if (!title || !content) {
            modalAlert.innerHTML = alert('warning', 'Заполните заголовок и текст');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Публикуем...';

        try {
            await api.post('/news', { title, content });
            form.reset();
            bootstrap.Modal.getInstance(modalEl)?.hide();
            alertEl.innerHTML = alert('success', 'Новость успешно опубликована');
            await onSuccess();
        } catch (err) {
            modalAlert.innerHTML = alert('danger', err.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Опубликовать';
        }
    });

    // Делегирование клика по кнопке удаления
    container.addEventListener('click', async (e) => {
        const delBtn = e.target.closest('.delete-news-btn');
        if (!delBtn) return;

        const id = delBtn.dataset.id;
        if (!confirm('Удалить эту новость?')) return;

        delBtn.disabled = true;
        try {
            await api.delete(`/news/${id}`);
            alertEl.innerHTML = alert('info', 'Новость удалена');
            await onSuccess();
        } catch (err) {
            alertEl.innerHTML = alert('danger', err.message);
            delBtn.disabled = false;
        }
    });
}
