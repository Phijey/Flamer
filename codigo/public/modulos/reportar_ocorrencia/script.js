const API_URL = 'http://localhost:3001/ocorrencias';
const IMGBB_KEY = '1e5faeadc224284482697159f47e9f01';
const USUARIO = 'JP';

let map;
let marker;
let ocorrencias = [];
let editandoId = null;
let fotosSelecionadas = [];
let fotosAtuais = [];

const form = document.getElementById('reportForm');
const fotoInput = document.getElementById('fotoInput');
const preview = document.getElementById('previewContainer');
const textoUpload = document.getElementById('uploadText');
const lista = document.getElementById('reportList');

function escapar(texto) {
    return String(texto || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function iniciarMapa() {
    map = L.map('map').setView([-19.9167, -43.9333], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
    }).addTo(map);

    map.on('click', function(e) {
        marcar(e.latlng.lat, e.latlng.lng);
    });
}

function marcar(lat, lng) {
    if (marker) {
        marker.setLatLng([lat, lng]);
    } else {
        marker = L.marker([lat, lng]).addTo(map);
    }

    document.getElementById('lat').value = lat.toFixed(6);
    document.getElementById('lng').value = lng.toFixed(6);
    map.panTo([lat, lng]);
}

function pegarGPS() {
    if (!navigator.geolocation) {
        alert('Geolocalização não suportada.');
        return;
    }

    navigator.geolocation.getCurrentPosition(function(posicao) {
        marcar(posicao.coords.latitude, posicao.coords.longitude);
        map.setZoom(16);
    }, function(erro) {
        alert('Erro ao obter localização: ' + erro.message);
    });
}

function mostrarPreviewArquivos(arquivos) {
    preview.innerHTML = '';

    if (!arquivos.length) {
        textoUpload.innerText = 'Anexar Imagens';
        return;
    }

    textoUpload.innerText = arquivos.length + ' imagem(ns) selecionada(s)';

    arquivos.forEach(function(arquivo) {
        const leitor = new FileReader();
        leitor.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'preview-item';
            preview.appendChild(img);
        };
        leitor.readAsDataURL(arquivo);
    });
}

function mostrarPreviewUrls(imagens) {
    preview.innerHTML = '';

    if (!imagens.length) {
        textoUpload.innerText = 'Anexar Imagens';
        return;
    }

    textoUpload.innerText = imagens.length + ' imagem(ns) anexada(s)';

    imagens.forEach(function(imagem) {
        const img = document.createElement('img');
        img.src = imagem.displayUrl || imagem.url;
        img.className = 'preview-item';
        preview.appendChild(img);
    });
}

async function subirImagem(file) {
    const formData = new FormData();
    formData.append('image', file);

    const resposta = await fetch('https://api.imgbb.com/1/upload?key=' + IMGBB_KEY, {
        method: 'POST',
        body: formData
    });

    const dados = await resposta.json();

    if (!resposta.ok || !dados.success) {
        throw new Error('Falha ao enviar imagem para o ImgBB.');
    }

    return {
        url: dados.data.url,
        displayUrl: dados.data.display_url,
        name: file.name
    };
}

function mostrarToast(msg, tipo) {
    let toast = document.getElementById('_toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = '_toast';
        toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);padding:10px 20px;border-radius:8px;font-size:14px;color:#fff;z-index:9999;max-width:90%;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,.2);transition:opacity .3s';
        document.body.appendChild(toast);
    }
    toast.style.background = tipo === 'erro' ? '#ef4444' : '#22c55e';
    toast.style.opacity = '1';
    toast.textContent = msg;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 4000);
}

async function carregarOcorrencias() {
    try {
        const resposta = await fetch(API_URL);
        ocorrencias = await resposta.json();
    } catch (erro) {
        console.error(erro);
        ocorrencias = [];
        mostrarToast('Servidor indisponível. Inicie o JSON Server em localhost:3001.', 'erro');
    }

    listarOcorrencias();
}

function listarOcorrencias() {
    lista.innerHTML = '';

    const minhas = ocorrencias.filter(function(item) {
        return item.usuario === USUARIO;
    }).sort(function(a, b) {
        return b.id - a.id;
    });

    if (!minhas.length) {
        lista.innerHTML = '<p class="empty-state">Nenhuma ocorrência encontrada.</p>';
        return;
    }

    minhas.forEach(function(item) {
        const card = document.createElement('div');
        card.className = 'report-item';
        card.onclick = function() {
            abrirModal(item.id);
        };

        const totalFotos = item.imagens ? item.imagens.length : 0;

        card.innerHTML =
            '<span class="report-date">' + escapar(item.data) + '</span>' +
            '<span class="report-type">' + escapar(item.tipo) + '</span>' +
            '<span class="report-status ' + escapar(item.severidade) + '">' + escapar(item.severidade).toUpperCase() + '</span>' +
            (totalFotos ? '<span class="report-photo-count">📷 ' + totalFotos + ' foto(s)</span>' : '');

        lista.appendChild(card);
    });
}

async function abrirModal(id) {
    const ocorrencia = ocorrencias.find(function(item) {
        return item.id === id;
    });

    if (!ocorrencia) return;

    const imagens = ocorrencia.imagens || [];
    let htmlImagens = '<div class="detail-empty">Sem imagens anexadas.</div>';

    if (imagens.length) {
        htmlImagens = '<div class="detail-gallery">';
        imagens.forEach(function(imagem) {
            htmlImagens +=
                '<a href="' + escapar(imagem.url) + '" target="_blank" rel="noreferrer" class="detail-gallery-item">' +
                '<img src="' + escapar(imagem.displayUrl || imagem.url) + '" alt="Imagem da ocorrência">' +
                '</a>';
        });
        htmlImagens += '</div>';
    }

    document.getElementById('modalContent').innerHTML =
        '<div class="detail-row"><div class="detail-label">Tipo</div><div class="detail-value">' + escapar(ocorrencia.tipo) + '</div></div>' +
        '<div class="detail-row"><div class="detail-label">Severidade</div><div class="detail-value">' + escapar(ocorrencia.severidade).toUpperCase() + '</div></div>' +
        '<div class="detail-row"><div class="detail-label">Descrição</div><div class="detail-value">' + escapar(ocorrencia.descricao || 'Sem descrição') + '</div></div>' +
        '<div class="detail-row"><div class="detail-label">Localização</div><div class="detail-value">Lat: ' + escapar(ocorrencia.lat) + ', Lng: ' + escapar(ocorrencia.lng) + '</div></div>' +
        '<div class="detail-row"><div class="detail-label">Fotos</div><div class="detail-value">' + htmlImagens + '</div></div>';

    document.getElementById('btnEditModal').onclick = function() {
        fecharModal();
        editarOcorrencia(id);
    };

    document.getElementById('btnDeleteModal').onclick = async function() {
        if (!confirm('Excluir registro?')) return;

        try {
            await fetch(API_URL + '/' + id, { method: 'DELETE' });
            ocorrencias = ocorrencias.filter(function(item) {
                return item.id !== id;
            });
            fecharModal();
            limparFormulario();
            listarOcorrencias();
        } catch (erro) {
            console.error(erro);
            alert('Não foi possível excluir.');
        }
    };

    document.getElementById('modalOverlay').style.display = 'flex';
}

function fecharModal() {
    document.getElementById('modalOverlay').style.display = 'none';
}

function editarOcorrencia(id) {
    const ocorrencia = ocorrencias.find(function(item) {
        return item.id === id;
    });

    if (!ocorrencia) return;

    editandoId = id;
    fotosSelecionadas = [];
    fotosAtuais = ocorrencia.imagens || [];

    form.tipo.value = ocorrencia.tipo || '';
    form.severidade.value = ocorrencia.severidade || '';
    form.descricao.value = ocorrencia.descricao || '';
    form.lat.value = ocorrencia.lat || '';
    form.lng.value = ocorrencia.lng || '';

    if (ocorrencia.lat && ocorrencia.lng) {
        marcar(parseFloat(ocorrencia.lat), parseFloat(ocorrencia.lng));
    }

    document.getElementById('formTitle').innerText = 'Editar Ocorrência';
    document.getElementById('btnSubmit').innerText = 'Salvar Alterações';
    mostrarPreviewUrls(fotosAtuais);
}

function limparFormulario() {
    editandoId = null;
    fotosSelecionadas = [];
    fotosAtuais = [];

    form.reset();
    fotoInput.value = '';
    preview.innerHTML = '';
    textoUpload.innerText = 'Anexar Imagens';

    if (marker) {
        map.removeLayer(marker);
        marker = null;
    }

    document.getElementById('formTitle').innerText = 'Detalhes da Ocorrência';
    document.getElementById('btnSubmit').innerText = 'Enviar Relatório';
}

fotoInput.addEventListener('change', function() {
    fotosSelecionadas = Array.from(this.files || []);
    fotosAtuais = [];
    mostrarPreviewArquivos(fotosSelecionadas);
});

form.addEventListener('submit', async function(evento) {
    evento.preventDefault();

    try {
        let imagens = fotosAtuais;

        if (fotosSelecionadas.length) {
            imagens = [];
            for (const file of fotosSelecionadas) {
                imagens.push(await subirImagem(file));
            }
        }

        const dados = {
            tipo: form.tipo.value,
            severidade: form.severidade.value,
            descricao: form.descricao.value,
            lat: form.lat.value,
            lng: form.lng.value,
            usuario: USUARIO,
            imagens: imagens
        };

        if (editandoId) {
            const ocorrencia = ocorrencias.find(function(item) {
                return item.id === editandoId;
            });

            if (!ocorrencia) throw new Error('Ocorrência não encontrada.');

            const atualizado = {
                ...ocorrencia,
                ...dados,
                data: ocorrencia.data,
                atualizadoEm: new Date().toLocaleString('pt-BR')
            };

            await fetch(API_URL + '/' + editandoId, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(atualizado)
            });

            ocorrencias = ocorrencias.map(function(item) {
                return item.id === editandoId ? atualizado : item;
            });

            alert('Ocorrência atualizada!');
        } else {
            const novo = {
                ...dados,
                id: Date.now(),
                data: new Date().toISOString().split('T')[0]
            };

            const resposta = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novo)
            });

            const salvo = await resposta.json();
            ocorrencias.unshift(salvo);
            alert('Ocorrência reportada com sucesso!');
        }

        limparFormulario();
        listarOcorrencias();
    } catch (erro) {
        console.error(erro);
        alert(erro.message || 'Não foi possível salvar.');
    }
});

function preencherDeQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const titulo = params.get('titulo');
    const alertaId = params.get('alerta');
    if (!titulo && !alertaId) return;

    if (titulo) {
        const tituloLower = titulo.toLowerCase();
        const tipoSelect = form.tipo;
        if (tituloLower.includes('foco') || tituloLower.includes('incend')) {
            tipoSelect.value = 'Foco de Calor';
        }
        const descField = form.descricao;
        if (!descField.value) {
            descField.value = alertaId ? `Alerta ${alertaId} — ${titulo}` : titulo;
        }
        document.getElementById('formTitle').innerText = 'Reportar: ' + titulo;
    }

    if (alertaId) {
        form.severidade.value = 'alta';
    }
}

window.addEventListener('load', function() {
    iniciarMapa();
    carregarOcorrencias();
    preencherDeQueryParams();
});

window.pegarGPS = pegarGPS;
window.fecharModal = fecharModal;
