window.addEventListener("DOMContentLoaded", () => {
  collection = new Collection();
  collection.decode();

  // unfocus editable divs when we press RETURN
  document
    .querySelector("[contenteditable]")
    .addEventListener("keypress", (evt) => {
      var keycode = evt.charCode || evt.keyCode;
      if (keycode === 13) {
        evt.target.blur();
        return false;
      }
    });

  // activate clipboard link
  document.querySelector(".i-clipboard").addEventListener("click", (evt) => {
    const link = collection.generateLink();
    throwConfetti(evt.target);
    navigator.clipboard.writeText(link);
  });
});

class Collection {

  constructor() {
    this.title = "Collection";
    this.collectable = {};
    this.collection = new Set();
    this.initFromPage();
  }

  initFromPage() {
    // create collectables from page
    let tags = document.querySelectorAll(".result .collectable");
    tags.forEach((el) => this.addCollectable(el2id(el)));
  }

  // use getters and setters to sync title to the DOM :)  
  get title() {
    return document.querySelector(".collection .collection-title").textContent;
  }
  set title(title) {
    document.querySelector(".collection .collection-title").textContent = title;
  }

  addCollectable(id) {
    this.collectable[id] = new Snippet(id);
  }

  getCollectable(id) {
    return this.collectable[id];
  }

  addToCollection(id) {
    const item = this.getCollectable(id);
    this.collection.add(item);
  }

  add(id) {
    const item = this.getCollectable(id);
    item.insert();
    this.collection.add(item);
  }

  delete(id) {
    const item = this.getCollectable(id);
    item.remove();
    this.collection.delete(item);
  }

  toggle(id) {
    const item = this.getCollectable(id);
    if (this.collection.has(item)) {
      this.collection.delete(item);
      item.remove();
    } else {
      this.collection.add(item);
      item.insert();
    }
  }

  encode() {
    const array = Array.from(this.collection);
    const ids = array.map((snippet) => snippet.id);
    const title = this.title;
    console.log("title", title);
    // TODO: create a collection hash from title and ids
    const collection = this.collection;
    return {
      collection: encodeURIComponent(collection),
      title: encodeURIComponent(title),
      ids: encodeURIComponent(ids),
    };
  }

  decode() {
    const query = new URLSearchParams(window.location.search);

    // assign title of the collection
    this.title = query.get("title") || "Collection";
    
    // TODO: check the collection hash, to make sure the data is complete and unchanged

    // fill the collection from the ids
    this.collection = new Set();
    const idstr = query.get("ids");
    if (idstr) {
      const ids = idstr.split(",");
      for (let id of ids) {
        this.add(id);
      }
    }
  }

  generateLink() {
    // url with query string removed
    const HOST = window.location.href.split("?")[0];
    const data = collection.encode();
    return `${HOST}?collection=${data.collection}&title=${data.title}&ids=${data.ids}`;
  }
}

class Snippet {
  constructor(id) {
    this.id = id;

    // get element in the collection list
    this.collected = document.querySelector(
      `.collection .collectable[data-snippet-id='${id}']`
    );

    // get all matching elements on the page and make them interactive
    this.els = document.querySelectorAll(
      `.collectable[data-snippet-id='${id}']`
    );
    this.els.forEach((el) => this.activate(el));
  }

  createCollected() {
    // TODO get label from elsewhere
    const label = `Snippet ${this.id}`;
    const html = `<li class="collectable" data-snippet-id="${this.id}" ><span class="toggle remove"></span><span class="${this.id}">${label}</span></li>`;
    return str2html(html);
  }

  // add mouse interaction to the toggle
  activate(el) {
    const toggle = el.querySelector(".toggle");
    toggle.addEventListener("click", this.toggle.bind(this));
  }

  // update the collection
  toggle(evt) {
    collection.toggle(this.id);
  }

  // view function triggered from the collection
  insert() {
    // create an element, but don't attach to the DOM in case it's not there
    if (!this.collected) {
      this.collected = this.createCollected();
      this.activate(this.collected);
    }

    // set '-' toggle  for all views of the snippet
    this.els.forEach((el) => {
      const toggle = el.querySelector(".toggle");
      toggle.classList.add("remove");
      toggle.classList.remove("add");
    });

    // add view to the collection div
    const parent = document.querySelector(".collection ul");

    // append snippet to the view
    parent.appendChild(this.collected);
  }

  // view function triggered from the collection
  remove() {
    // set '+' toggle  for all views of the snippet
    this.els.forEach((el) => {
      const toggle = el.querySelector(".toggle");
      toggle.classList.remove("remove");
      toggle.classList.add("add");
    });

    // remove view from the collection div
    this.collected.remove();
  }
}

function el2id(el) {
  return el.dataset.snippetId;
}

function str2html(str) {
  const div = document.createElement("div");
  div.innerHTML = str.trim();
  return div.firstChild;
}
