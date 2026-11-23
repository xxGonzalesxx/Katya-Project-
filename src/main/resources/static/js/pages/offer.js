const STORAGE_KEY = 'offer_accepted';
const BANNER_ID = 'offer-banner';

export function renderOffer() {
    if (localStorage.getItem(STORAGE_KEY) === 'true') return;
    if (document.getElementById(BANNER_ID)) return;

    const banner = document.createElement('div');
    banner.id = BANNER_ID;
    banner.className = 'offer-banner';
    banner.innerHTML = `
        <div class="offer-banner__content">
            <span>
                Используя сайт, вы соглашаетесь с
                <a href="#/rules">правилами общежития</a>
                и условиями обработки данных в рамках сервиса.
            </span>
            <button type="button" class="btn btn-primary btn-sm" id="offer-accept">Принять</button>
        </div>
    `;

    document.body.appendChild(banner);

    document.getElementById('offer-accept')?.addEventListener('click', () => {
        localStorage.setItem(STORAGE_KEY, 'true');
        banner.remove();
    });
}