/**
 * Безопасное экранирование HTML для защиты от XSS
 */
export function escapeHtml(str) {
    return String(str ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

/**
 * Современный Skeleton-загрузчик для списков и карточек
 */
export function skeletonCards(count = 3) {
    return Array.from({ length: count }, () => `
        <div class="card mb-3 p-3" aria-hidden="true">
            <div class="card-body placeholder-glow">
                <h5 class="card-title"><span class="placeholder col-4 rounded-2"></span></h5>
                <p class="card-text">
                    <span class="placeholder col-7 rounded-2"></span>
                    <span class="placeholder col-4 rounded-2"></span>
                    <span class="placeholder col-8 rounded-2"></span>
                </p>
            </div>
        </div>
    `).join('');
}

/**
 * Аккуратное уведомление с кнопкой закрытия
 */
export function alert(type, message, dismissible = true) {
    return `
        <div class="alert alert-${escapeHtml(type)} ${dismissible ? 'alert-dismissible fade show' : ''} rounded-3 border-0 shadow-sm" role="alert">
            ${escapeHtml(message)}
            ${dismissible ? '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Закрыть"></button>' : ''}
        </div>
    `;
}

/**
 * Заглушка для пустых списков
 */
export function emptyState(message, actionHtml = '') {
    return `
        <div class="card p-5 text-center my-2">
            <div class="fs-1 mb-2 opacity-50">📭</div>
            <p class="text-muted-sm mb-3">${escapeHtml(message)}</p>
            ${actionHtml ? `<div>${actionHtml}</div>` : ''}
        </div>
    `;
}
