const LOGIN_URL = "/modulos/login/login.html";
let RETURN_URL = "/modulos/login/index.html";
const LS_KEY = 'flamer_usuarios';
const API_PORTS = [3001];

var db_usuarios = {};
var usuarioCorrente = {};

async function fetchFromApi(path) {
    let lastError;

    for (const port of API_PORTS) {
        try {
            const response = await fetch(`http://localhost:${port}/${path}`);
            if (response.ok) return response.json();
            lastError = new Error(`HTTP ${response.status}`);
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError;
}

function initLoginApp() {
    let pagina = window.location.pathname;
    if (pagina != LOGIN_URL) {
        sessionStorage.setItem('returnURL', pagina);
        RETURN_URL = pagina;

        usuarioCorrenteJSON = sessionStorage.getItem('usuarioCorrente');
        if (usuarioCorrenteJSON) {
            usuarioCorrente = JSON.parse(usuarioCorrenteJSON);
        } else {
            window.location.href = LOGIN_URL;
        }

        document.addEventListener('DOMContentLoaded', function () {
            showUserInfo('userInfo');
            updateShellFromSession();
        });
    } else {
        let returnURL = sessionStorage.getItem('returnURL');
        RETURN_URL = returnURL || RETURN_URL;
        carregarUsuarios(() => {
            console.log('Usuários carregados...');
        });
    }
}

async function carregarUsuarios(callback) {
    try {
        db_usuarios = await fetchFromApi('usuarios');
    } catch (e) {
        try {
            const raw = localStorage.getItem(LS_KEY);
            db_usuarios = raw ? JSON.parse(raw) : [];
        } catch (e2) {
            db_usuarios = [];
        }
    }
    if (callback) callback();
}

function salvarUsuarios() {
    localStorage.setItem(LS_KEY, JSON.stringify(db_usuarios));
}

function loginUser(identificador, senha) {
    const id = String(identificador || '').trim().toLowerCase();
    for (var i = 0; i < db_usuarios.length; i++) {
        var usuario = db_usuarios[i];
        const email = String(usuario.email || '').toLowerCase();
        const nome = String(usuario.nome || '').toLowerCase();
        if ((id === email || id === nome) && senha == usuario.senha) {
            usuarioCorrente = {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo,
            };
            sessionStorage.setItem('usuarioCorrente', JSON.stringify(usuarioCorrente));
            return true;
        }
    }
    return false;
}

function logoutUser() {
    sessionStorage.removeItem('usuarioCorrente');
    window.location = LOGIN_URL;
}

function addUser(nome, login, senha, email) {
    carregarUsuarios(() => {
        let usuario = {
            id: Date.now(),
            login: login,
            senha: senha,
            nome: nome,
            email: email
        };
        db_usuarios.push(usuario);
        salvarUsuarios();
        displayMessage("Usuário inserido com sucesso");
    });
}

async function getCurrentUserFarm() {
    try {
        const locais = await fetchFromApi('locais');
        const farm = locais.find(local => Number(local.usuarioId) === Number(usuarioCorrente.id));
        return farm || null;
    } catch (e) {
        return null;
    }
}

function showUserInfo(element) {
    var elemUser = document.getElementById(element);
    if (elemUser) {
        elemUser.innerHTML = `${usuarioCorrente.nome} (${usuarioCorrente.email})
                    <a onclick="logoutUser()">❌</a>`;
    }
}

function updateShellFromSession() {
    if (!usuarioCorrente || !usuarioCorrente.nome) return;
    var abbr = String(usuarioCorrente.nome)
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(function(p) { return p[0]; })
        .join('')
        .toUpperCase();
    document.querySelectorAll('.user-avatar, .top-avatar, .topbar-avatar').forEach(function(el) {
        el.textContent = abbr;
    });
    document.querySelectorAll('.user-name').forEach(function(el) {
        el.textContent = usuarioCorrente.nome;
    });
    document.querySelectorAll('.profile-avatar').forEach(function(el) {
        el.textContent = abbr;
    });
    var footer = document.querySelector('.sidebar-footer');
    if (footer && !footer.querySelector('.shell-logout')) {
        var actions = document.createElement('div');
        actions.className = 'shell-actions';
        actions.style.cssText = 'display:flex;flex-direction:column;gap:6px;margin-top:10px;';
        var aboutHref = location.pathname.includes('/modulos/') ? '../../about.html' : 'about.html';
        var about = document.createElement('a');
        about.className = 'shell-about';
        about.href = aboutHref;
        about.textContent = 'Sobre o Flamer';
        about.style.cssText = 'font-size:12px;color:var(--text-secondary,#6B6861);text-decoration:none;';
        var logout = document.createElement('button');
        logout.className = 'shell-logout';
        logout.type = 'button';
        logout.textContent = 'Sair';
        logout.style.cssText = 'font:inherit;font-size:12.5px;font-weight:600;color:#C2410C;background:transparent;border:1px solid rgba(194,65,12,.3);border-radius:10px;padding:8px 10px;cursor:pointer;';
        logout.addEventListener('click', function() {
            if (typeof logoutUser === 'function') logoutUser();
        });
        actions.appendChild(about);
        actions.appendChild(logout);
        footer.appendChild(actions);
    }
}

function displayMessage(msg) {
    alert(msg);
}

initLoginApp();
