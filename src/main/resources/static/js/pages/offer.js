const STORAGE_KEY = 'offer_accepted';

export function renderOffer(container) {
    if (localStorage.getItem(STORAGE_KEY) === 'true') return;

    const banner = document.createElement('div');
    banner.className = 'offer-banner';
    banner.innerHTML = `
        <div class="offer-banner__content">
            <span>
                Используя сайт, вы соглашаетесь с
                <a href="#/offer">офертой</a> и
                <a href="#/rules">правилами общежития</a>,
                а также с использованием cookie.
            </span>
            <button class="btn btn-primary btn-sm" id="offer-accept">Принять</button>
        </div>
    `;
    document.body.appendChild(banner);

    document.getElementById('offer-accept').addEventListener('click', () => {
        localStorage.setItem(STORAGE_KEY, 'true');
        banner.remove();
    });
}