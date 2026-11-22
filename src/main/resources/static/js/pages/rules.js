export function renderRules(container) {
    container.innerHTML = `
        <div class="container py-4">
            <h1 class="text-center mb-4">Правила общежития</h1>
            <section class="mb-4">
                <h2 class="h4">1. Общие положения</h2>
                <ul class="list-group list-group-flush">
                    <li class="list-group-item">Кто может проживать: студенты, аспиранты, сотрудники.</li>
                    ...
                </ul>
            </section>
            ...
        </div>
    `;
}