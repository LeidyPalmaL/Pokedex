/*
    Aplicación Web que permite consultar Pokemons mediante consumo de PokeAPIs.

    https://pokeapi.co/api/v2/pokemon?offset=0&limit=14
    Es el API que retorna una lista de Pokemons y su respectiva URL para conocer sus detalles.
    El API requiere dos parámetros:
    1. limit = cantidad de elementos de la lista, es decir el tamaño de página. 
                Para esta aplicación, decidimos traer 14 elementos, es decir, que el tamaño de página es 14.
    2. offset = es la cantidad de elementos anteriores a esta lista. Al comienzo es 0, por ser la primera página.
                Para la segunda página, el offset será de 14, para la siguiente será de 28 y así, sucesivamente,
                en múltiplos de 14.
    El resultado del API contiene:
    1. next = la URL a la página siguiente.
    2. previous = la URL a la página anterior.
    3. results = arreglo o lista de 14 Pokemons. Cada Pokemon tiene:
                name = nombre del Pokemon
                url = API que retorna los detalles de ese Pokemon
    
    https://pokeapi.co/api/v2/pokemon/NOMBRE
    Es el API que retorna la información de un Pokemon en particular, donde NOMBRE es el nombre del Pokemon. 
    Por ejemplo, beedrill

    El resultado en cualquiera de las dos API contiene:
    1. height = altura del Pokemon
    2. weight = peso del Pokemon
    3. abilities = arreglo o lista de habilidades. De cada habilidad, solo tomamos el nombre (name).
    4. moves = arreglo o lista de movimientos. De cada movimiento, solo tomamos el nombre (name).
    5. sprites = arreglo o lista de imágenes del Pokemon. De cada imagen, tomamos:
            front_shiny = url de la imagen brillante de frente.
            back_shiny = url de la imagen brillante de espaldas.
    6. types = arreglo o lista de tipos del Pokemon. De cada tipo solamente tomamos el nombre (name).

    Proceso:

    1. Consume el API que retorna la lista de Pokemons
    2. Para cada Pokemon,
    2.1  Crea una tarjeta con el nombre del pokemon, la imagen brillante de frente y su lista de tipos.
    2.2  La tarjeta es contenida en un botón, para que, al darle click, se despliegue información detallada.
    3. Si se presionan los botones prev y next,
    3.1  Se consume nuevamente el API, pero para el siguiente o anterior grupo de 14 pokemones.
    3.2  Si se avanza hasta la última página, el botón next se esconde.
    3.3  Si se regresa hasta la primera página, el botón prev se esconde.
    4. Si se escribe un nombre de Pokemon en el buscador y se presiona Enter,
    4.1  Se consume el API que retorna información de un Pokemon en particular, tomando como nombre, la palabra
         que el usuario escribió en el buscador.
    5. Cuando la ventana modal esté mostrando información de un Pokemon, si se da click en cualquier parte de 
       la ventana, la ventana modal se cierra.
*/

// DOM- Nos permite acceder y manipular el archivo HTML. Se le da la propiedad de escuchar los eventos que
//ocurren en el HTML, click, input, etc

//Espera a que se cargue todo el DOM y entonces ejcuta la función init
document.addEventListener('DOMContentLoaded', init);

//La variable global "UrlsNav" contiene las 2 urls que nos permitiran avanzar o retroceder de una página a otra.
var urlsNav = {
    prev: "",
    next: ""
};

//Pone en memoria todos los elementos del DOM que van a ser usados en el programa y añade escuchador de eventos
//cuando sea necesario. Finalmente, consume el API que genera la primera página de pokemons.
function init() {
    // Div que contendrá las 14 tarjetas de pokemons.
    const grid = document.getElementById('grid');

    // Button que permite regresar a la página anterior
    const prev = document.getElementById('prev');
    prev.addEventListener('click', showPrevGrid);

    // Button que permite avanzar a la siguiente página
    const next = document.getElementById('next');
    next.addEventListener('click', showNextGrid);

    // Ventana modal que se sobrepone a todo el contenido
    const modal = document.getElementById('modal');
    // Cuadro interno de la ventana modal que mostrará el detalle del Pokemon
    const modalContent = document.getElementById('modalContent');

    // Cuadro de texto que permite al usuario buscar un Pokemon por nombre
    const inputSearch = document.getElementById('inputSearch');
    //Espera que el usuario oprima una tecla (enter) y ejecuta la busqueda
    inputSearch.addEventListener('keyup', searchPokemon);

    //Espera que el usuario de un click en cualquier parte de la ventana para cerrar el modal
    window.addEventListener('click', closeModal);

    // Consume el API que trae la primera página de 14 pokemons y envía el resultado a la función showCards
    callApi("https://pokeapi.co/api/v2/pokemon?offset=0&limit=16", showCards);
}

//Ejecuta un API que viene en URL y ejecuta el callback con el resultado que devolvió el API
function callApi(url, callback) {
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    //Fetch Ejecuta la url y espera la respuesta. Cuando ya se obtiene respuesta:
    //1. Convierte la respeusta en texto.
    //2. Envía el resultado a la función "callback"
    //Pero, si el API falla y no entrega respuesta, se envía el error a la función showError
    fetch(url, requestOptions)
        .then(response => response.text())
        .then(result => callback(result))
        .catch(error => showError(error));
}

//Configura los botones Prev y Netx y muestra el conjunto de tarjetas de pokemons
function showCards(result) {
    let objectResult = JSON.parse(result);

    //Guarda las URL de las paginas anterior y siguiente, para uso posterior
    urlsNav.prev = objectResult.previous;
    urlsNav.next = objectResult.next;

    //Cuando en la URL venga la palabra null el boton prev se esconderá.
    if (urlsNav.prev == null) {
        prev.classList.add('hideButton');
    }
    else {
        prev.classList.remove('hideButton');
    }

    //Cuando en la URL venga la palabra null el boton next se esconderá.
    if (urlsNav.next == null) {
        next.classList.add('hideButton');
    }
    else {
        next.classList.remove('hideButton');
    }

    //Se recorre el arreglo results que contiene 14 pokemones y cada uno es guardado en 
    //la constante pokemon para tomar la URL específica que trae toda la información de ese pokemon. Esa 
    //información se envía a la función showCard
    for (const pokemon of objectResult.results) {
        callApi(pokemon.url, showCard);
    }
}

// Muestra una tarjeta de pokemons. La tarjeta es un DIV contenido en un BUTTON.
// El DIV contiene el nombre del pokemon, la imagen brillante de frente y los tipos a los que pertenece.
function showCard(result) {
    let objectResult = JSON.parse(result);
    console.log(`Name: ${objectResult.name}`);

    //Crea un boton con el nombre del pokemon y la función que se ejecutará cuando le den click al botón.
    let button = createButton(objectResult.name, queryPokemon);
    button.classList.add('cardButton');

    //El botón se añade al grid de tarjetas
    grid.appendChild(button);

    //Crea un DIV con la clase card de css.
    let card = createDiv('card');

    //El DIV se añade al BUTTON
    button.appendChild(card);

    //Crea un DIV con la clase data, para contener el nombre del Pokemon
    let nameDiv = createDiv('data');
    card.appendChild(nameDiv);

    //Crea un LABEL con la palabra Name y la clase title de css
    //El LABEL queda añadido al DIV nameDiv
    let label = createLabel('Name:', 'title', nameDiv);
    //Crea un LABEL con el nombre del Pokemon y no se le asigna ninguna clase css
    //El LABEL queda añadido al DIV nameDiv
    let labelName = createLabel(objectResult.name, '', nameDiv);

    //Crea una IMG con la url de la imagen brillante del Pokemon de frente
    //La IMG queda añadida al DIV card
    let img = createImg(objectResult.sprites.front_shiny, card);

    console.log(`Image: ${objectResult.sprites.front_shiny}`);

    //Crea otro DIV con la clase data, para contener los tipos del Pokemon
    let typesDiv = createDiv('data');
    card.appendChild(typesDiv);

    //Crea un LABEL con la palabra Types y la clase title de css
    //El LABEL queda añadido al DIV typesDiv
    let labelTypes = createLabel('Types:', 'title', typesDiv);

    //Recorre la lista de types del Pokemon y guarda cada uno en typeObject
    for (const typeObject of objectResult.types) {
        //Para cada tipo se crea un LABEL con el nombre del type, sin clase css y queda añadido a typesDiv
        let labelType = createLabel(typeObject.type.name, '', typesDiv)
        console.log(`Type: ${typeObject.type.name}`);
    }
}

// Muestra, en una ventana modal, los detalles de un pokemon, cuando se le ha dado click y 
// se ha consultado su API respectiva.
function showDetails(result) {
    let objectResult = JSON.parse(result);

    // Limpia el contenido de la ventana modal
    clearContainer(modalContent);

    //Crea un DIV con la clase data2, para contener el nombre del Pokemon
    let divName = createDiv('data2');
    modalContent.appendChild(divName);

    //Crea un LABEL con la palabra Pokemon y la clase title de css
    //El LABEL queda añadido al DIV divName
    let labelName = createLabel(`Pokemon: `, 'title', divName);

    //Crea un LABEL con el nombre del Pokemon y no se le asigna ninguna clase css
    //El LABEL queda añadido al DIV divName
    let name = createLabel(objectResult.forms[0].name, '', divName);

    //Crea un DIV con la clase data2, para contener el peso del Pokemon
    let divWeight = createDiv('data2');
    modalContent.appendChild(divWeight);

    //Crea un LABEL con la palabra Weight y la clase title de css
    //El LABEL queda añadido al DIV divWeight
    let labelWeight = createLabel(`Weight: `, 'title', divWeight);

    //Crea un LABEL con el peso del Pokemon y no se le asigna ninguna clase css
    //El LABEL queda añadido al DIV divWeight
    let weight = createLabel(objectResult.weight, '', divWeight);
    console.log(objectResult.weight);

    //Crea un DIV con la clase data2, para contener la altura del Pokemon
    let divHeight = createDiv('data2');
    modalContent.appendChild(divHeight);

    //Crea un LABEL con la palabra Height y la clase title de css
    //El LABEL queda añadido al DIV divHeight
    let labelHeight = createLabel(`Height: `, 'title', divHeight);

    //Crea un LABEL con la altura del Pokemon y no se le asigna ninguna clase css
    //El LABEL queda añadido al DIV divHeight
    let height = createLabel(objectResult.height, '', divHeight);
    console.log(objectResult.height);

    //Crea un DIV con la clase data2, para contener las habilidades del Pokemon
    let divAbilities = createDiv('data2');
    modalContent.appendChild(divAbilities);

    //Crea un LABEL con la palabra Abilities y la clase title de css
    //El LABEL queda añadido al DIV divAbilities
    let labelAbilities = createLabel(`Abilities: `, 'title', divAbilities);

    //Recorre la lista de abilities del Pokemon y guarda cada uno en abilityObject
    for (const abilityObject of objectResult.abilities) {
        //Para cada ability se crea un LABEL con el nombre de la habilidad, sin clase css y 
        //queda añadido a divAbilities
        let ability = createLabel(`${abilityObject.ability.name}`, '', divAbilities);
        console.log(`Ability: ${abilityObject.ability.name}`);
    }

    //Crea un DIV con la clase data2, para contener los movimientos del Pokemon
    let divMoves = createDiv('data2');
    modalContent.appendChild(divMoves);

    //Crea un LABEL con la palabra Moves y la clase title de css
    //El LABEL queda añadido al DIV divMoves
    let labelMoves = createLabel(`Moves: `, 'title', divMoves);
    let i = 0;
    for (const moveObject of objectResult.moves) {
        //Para cada move se crea un LABEL con el nombre del movimiento, sin clase css y 
        //queda añadido a divMoves
        let move = createLabel(`${moveObject.move.name}`, '', divMoves);
        console.log(`Move: ${moveObject.move.name}`);
        i++;

        //La cantidad de moves de un Pokemon es muy elevada, por eso, hemos decidio mostrar solamente
        //5 movimientos.
        if (i == 5) {
            break;
        }
    }

    //Finalmente, después de añadir toda la información a la ventana modal,
    //se toma la imagen brillante de espaldas del pokemon
    let urlBackImage = objectResult.sprites.back_shiny;
    console.log(urlBackImage);

    //Se crea una IMG con la url de la imagen del Pokemon y se añade a la ventana modal.
    let image = createImg(urlBackImage, modalContent);

    //La ventana modal ya está creada antes de ejecutar el programa, pero tiene un display: none
    //aquí le cambiamos a display: block para hacerla visible.
    modal.style.display = 'block';
}

// Consulta un Pokemon particular, tomando su nombre (name) del id del botón.
function queryPokemon() {
    let name = this.id;

    callApi(`https://pokeapi.co/api/v2/pokemon/${name}`, showDetails);
}

// Busca un Pokemon particular, tomando su nombre (name) de la palabra escrita en el cuadro de búsqueda.
// Esto sucede solamente si se detecta que la tecla Enter fue presionada.
function searchPokemon(e) {
    var keycode = e.keyCode || e.which;

    //13 es el código de la tecla Enter
    if (keycode == 13) {
        let name = inputSearch.value.toLowerCase();
        console.log(name);
        callApi(`https://pokeapi.co/api/v2/pokemon/${name}`, showDetails);
    }
}

// Crea un DIV y le asigna una clase css
function createDiv(cssClass) {
    let div = document.createElement('div');
    div.classList.add(cssClass);

    return div;
}

// Crea un LABEL, le asigna una clase css y lo añade a un contenedor
function createLabel(text, cssClass, container) {
    let label = document.createElement('label');
    label.textContent = text;

    if (cssClass != '') {
        label.classList.add(cssClass);
    }

    container.appendChild(label);

    return label;
}

// Crea una IMG, y usa como src (source) la url que llega como parámetro.
// Añade la IMG al un contenedor
function createImg(url, container) {
    let img = document.createElement('img');
    img.src = url;

    container.appendChild(img);

    return img;
}

// Crea un BUTTON con el texto que viene en name y le asocia la función que se ejecutará al darle click
function createButton(name, callback) {
    let button = document.createElement('button');
    button.setAttribute('id', name);
    button.addEventListener('click', callback)

    return button;
}

// Ejecuta el API para solicitar la página o grupo anterior de pokemons y los muestra en el DIV grid
function showPrevGrid() {
    clearContainer(grid);

    callApi(urlsNav.prev, showCards);
}

// Ejecuta el API para solicitar la página o grupo siguiente de pokemons y los muestra en el DIV grid
function showNextGrid() {
    clearContainer(grid);

    callApi(urlsNav.next, showCards);
}

// Recorre un contenedor, eliminando cada uno de sus elementos hijo.
function clearContainer(container) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
}

// Cierra la ventana modal. En realidad lo que hace es esconderla con display: none
function closeModal(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Usa la ventana modal para mostrar un mensaje de error, por ejemplo, No hay información disponible.
function showError(error){
    clearContainer(modalContent);
    let label = createLabel("Information not available", 'title', modalContent);

    modal.style.display = 'block';
}