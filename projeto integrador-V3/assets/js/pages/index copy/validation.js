
let usuarios = [];

if (localStorage.getItem("usuarios")) {
    usuarios = JSON.parse(localStorage.getItem("usuarios"));
    console.log(usuarios);
}

const form = document.getElementById('formCadastro');

form.addEventListener('submit', function (event) {
    event.preventDefault(); 

    // Limpar erro
    document.querySelectorAll('.erro').forEach(e => e.textContent = '');

    let nome = document.getElementById('nomeInputCadastro').value.trim();
    let valido = true;

    // Validação do nome
    if (nome.length < 3) {
        document.getElementById('nomeErro').textContent = 'O nome deve ter pelo menos 3 caracteres.';
        valido = false;
    }

    // Validação do email
    //const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //if (!regexEmail.test(email)) {
    //    document.getElementById('emailErro').textContent = 'Digite um email válido.';
    //    valido = false;
    //}

    // Validação da senha
    //if (senha.length < 6) {
    //    document.getElementById('senhaErro').textContent = 'A senha deve ter no mínimo 6 caracteres.';
    //    valido = false;
    //}

    function salvarStorage() {
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
    }

    // cadastro bem sucedido
    if (valido) {
        alert('Cadastro realizado com sucesso!');
        window.location.href = "cardapio.html";

        form.reset();

        const usuario = {nome};

        usuarios.push(usuario);

        document.getElementById('nomeInputCadastro').value = '';
        // document.getElementById('emailInputCadastro').value = '';
        // document.getElementById('senhaInputCadastro').value = '';

        salvarStorage();
    }
});