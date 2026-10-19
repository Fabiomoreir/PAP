const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const toast = (message) => {
  const el = $('#toast'); el.textContent = message; el.classList.add('show');
  clearTimeout(window.toastTimer); window.toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
};
if (window.lucide) window.lucide.createIcons();

const sectionTitles = {
  dashboard: 'Painel de Administração', vagas: 'Gerir vagas', empresas: 'Gerir empresas',
  candidatos: 'Gerir candidatos', candidaturas: 'Gerir candidaturas', contactos: 'Gerir contactos', definicoes: 'Definições'
};
function showSection(name) {
  if (!sectionTitles[name]) name = 'dashboard';
  $$('.page-section').forEach(section => section.classList.toggle('active-section', section.id === `section-${name}`));
  $$('.nav-link[data-section]').forEach(link => link.classList.toggle('active', link.dataset.section === name));
  $('.sidebar').classList.remove('open');
  document.title = `${sectionTitles[name]} | EMPRESTP`;
  window.location.hash = name;
}
$$('.nav-link[data-section]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault(); showSection(link.dataset.section);
}));
$$('[data-go]').forEach(button => button.addEventListener('click', () => showSection(button.dataset.go)));
$('#menuToggle').addEventListener('click', () => $('.sidebar').classList.toggle('open'));
$('#logout').addEventListener('click', event => {
  event.preventDefault();
  if (confirm('Pretende terminar a sessão?')) toast('Demonstração: ligue este botão ao logout PHP.');
});

const dialog = $('#itemDialog'), fields = $('#dialogFields');
let currentType = '';
function openAddDialog(type) {
  currentType = type;
  const configs = {
    vaga: { title: 'Publicar nova vaga', fields: [['Título da vaga','title','text'],['Empresa','company','text'],['Localização','location','text']] },
    empresa: { title: 'Adicionar empresa', fields: [['Nome da empresa','name','text'],['Email de contacto','email','email'],['Localização','location','text']] },
    candidato: { title: 'Adicionar candidato', fields: [['Nome completo','name','text'],['Email','email','email'],['Área profissional','area','text']] }
  };
  const config = configs[type]; $('#dialogTitle').textContent = config.title;
  fields.innerHTML = config.fields.map(([label,name,inputType]) => `<label>${label}<input name="${name}" type="${inputType}" required></label>`).join('');
  dialog.showModal();
}
$('#addVacancy').addEventListener('click', () => openAddDialog('vaga'));
$('#addVacancyTop').addEventListener('click', () => openAddDialog('vaga'));
$('#quickVacancy').addEventListener('click', () => openAddDialog('vaga'));
$('#addCompany').addEventListener('click', () => openAddDialog('empresa'));
$('#quickCompany').addEventListener('click', () => openAddDialog('empresa'));
$('#addCandidate').addEventListener('click', () => openAddDialog('candidato'));
$('#quickCandidate').addEventListener('click', () => openAddDialog('candidato'));

$('#itemForm').addEventListener('submit', event => {
  if (event.submitter && event.submitter.value === 'cancel') return;
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget).entries());
  if (!event.currentTarget.reportValidity()) return;
  if (currentType === 'vaga') {
    const row = document.createElement('tr');
    row.dataset.search = `${data.title} ${data.company} ${data.location}`.toLowerCase();
    row.innerHTML = `<td></td><td></td><td></td><td><span class="status active">Ativa</span></td><td><button class="small-button delete-vacancy">Eliminar</button></td>`;
    row.cells[0].textContent = data.title; row.cells[1].textContent = data.company; row.cells[2].textContent = data.location;
    $('#vacanciesBody').prepend(row); bindDelete(row);
    const count = $$('#vacanciesBody tr').length;
    $('#statVagas').textContent = Number($('#statVagas').textContent) + 1;
    $('#vacancyCount').textContent = `${count} vagas nesta demonstração`;
    toast('Vaga adicionada ao ecrã. Ainda não foi guardada na base de dados.');
  } else if (currentType === 'empresa') {
    const row = $('#companiesBody').insertRow(0);
    [data.name, data.email, data.location].forEach(value => { const cell = row.insertCell(); cell.textContent = value; });
    row.insertCell().innerHTML = '<span class="status new">Pendente</span>';
    $('#statEmpresas').textContent = Number($('#statEmpresas').textContent) + 1;
    toast('Empresa adicionada ao ecrã. Ainda não foi guardada na base de dados.');
  } else {
    const row = $('#candidatesBody').insertRow(0);
    [data.name, data.email, data.area].forEach(value => { const cell = row.insertCell(); cell.textContent = value; });
    row.insertCell().innerHTML = '<span class="status active">Ativo</span>';
    $('#statCandidatos').textContent = Number($('#statCandidatos').textContent) + 1;
    toast('Candidato adicionado ao ecrã. Ainda não foi guardado na base de dados.');
  }
  dialog.close(); event.currentTarget.reset();
});
function bindDelete(row) {
  const button = $('.delete-vacancy', row);
  if (!button) return;
  button.addEventListener('click', () => {
    if (confirm('Tem a certeza de que pretende remover esta vaga do ecrã?')) {
      row.remove(); $('#statVagas').textContent = Math.max(0, Number($('#statVagas').textContent) - 1);
      $('#vacancyCount').textContent = `${$$('#vacanciesBody tr').length} vagas nesta demonstração`;
      toast('Vaga removida do ecrã. A base de dados não foi alterada.');
    }
  });
}
$$('#vacanciesBody tr').forEach(bindDelete);
$('#vacancySearch').addEventListener('input', event => {
  const term = event.target.value.toLocaleLowerCase('pt');
  $$('#vacanciesBody tr').forEach(row => row.hidden = !row.dataset.search.includes(term));
});
$('#saveSettings').addEventListener('click', () => toast('Alterações apenas demonstrativas; ainda não foram guardadas na base de dados.'));
$$('.status-select').forEach(select => select.addEventListener('change', () => toast(`Estado alterado no ecrã para: ${select.value}`)));
window.addEventListener('hashchange', () => showSection(location.hash.slice(1)));
if (location.hash && sectionTitles[location.hash.slice(1)]) showSection(location.hash.slice(1));
