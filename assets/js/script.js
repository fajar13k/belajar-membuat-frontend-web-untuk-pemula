const books = [];
const RENDER_EVENT = "render_books";
const SAVED_EVENT = "saved_book";
const STORAGE_KEY = "RAK_BUKU";

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage!");
    return false;
  }
  return true;
}

function searchBook(bookTitle = "") {
  let filteredBook;

  filteredBook = books.filter((book) =>
    book?.title?.toLowerCase().includes(bookTitle)
  );

  books.splice(0, books.length);
  books.push(...filteredBook);

  console.log(books);

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
  books.splice(0, books.length);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

function findBook(bookId) {
  for (bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function saveBook() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function addBook() {
  const generatedId = generateId();
  const bookTitle = document.getElementById("title").value;
  const bookAuthor = document.getElementById("author").value;
  const bookYear = parseInt(document.getElementById("year").value);

  const bookObject = generateBookObject(
    generatedId,
    bookTitle,
    bookAuthor,
    bookYear,
    false
  );

  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBook();
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget === null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBook();
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget === null) return;

  bookTarget.isComplete = false;

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBook();
}

function removeBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBook();
}

function makeBookInterface(bookObject) {
  const bookTitleAndYear = document.createElement("h3");
  bookTitleAndYear.innerText = `${bookObject.title} (${bookObject.year})`;

  const bookAuthor = document.createElement("p");
  bookAuthor.innerText = `By ${bookObject.author}`;

  const bookDetailContainer = document.createElement("div");
  bookDetailContainer.classList.add("book-detail");
  bookDetailContainer.append(bookTitleAndYear, bookAuthor);

  const bookActionContainer = document.createElement("div");
  bookActionContainer.classList.add("book-action");

  if (bookObject.isComplete) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("btn", "btn-card-action", "mr-2");
    undoButton.setAttribute("type", "button");
    undoButton.setAttribute("value", "undo");
    undoButton.setAttribute("name", "undo");
    undoButton.innerText = "Read Again";
    undoButton.addEventListener("click", () => {
      undoBookFromCompleted(bookObject.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("btn", "btn-card-action");
    deleteButton.setAttribute("type", "button");
    deleteButton.setAttribute("value", "delete");
    deleteButton.setAttribute("name", "Delete");
    deleteButton.innerText = "Delete";
    deleteButton.addEventListener("click", () => {
      removeBookFromCompleted(bookObject.id);
    });

    bookActionContainer.append(undoButton, deleteButton);
  } else {
    const completeButton = document.createElement("button");
    completeButton.classList.add("btn", "btn-card-action");
    completeButton.setAttribute("type", "button");
    completeButton.setAttribute("value", "finish");
    completeButton.setAttribute("name", "finish");
    completeButton.innerText = "Finished!";
    completeButton.addEventListener("click", () => {
      addBookToCompleted(bookObject.id);
    });

    bookActionContainer.append(completeButton);
  }

  const cardFlexContainer = document.createElement("article");
  cardFlexContainer.classList.add("card-flex");
  cardFlexContainer.append(bookDetailContainer, bookActionContainer);

  document.getElementById("title").value = "";
  document.getElementById("author").value = "";
  document.getElementById("year").value = "";

  return cardFlexContainer;
}

document.addEventListener("DOMContentLoaded", () => {
  if (isStorageExist()) {
    loadDataFromStorage();
  }

  const submitForm = document.getElementById("form");
  submitForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addBook();
  });

  const searchForm = document.getElementById("form-search");
  const inputSearch = document.getElementById("search-title");
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (inputSearch.value === "") {
      loadDataFromStorage();
    } else {
      searchBook(inputSearch.value);
    }
  });

  const clearSearch = document.getElementById("clear");
  clearSearch.addEventListener("click", (event) => {
    event.preventDefault();
    loadDataFromStorage();
    inputSearch.value = "";
  });
});

document.addEventListener(RENDER_EVENT, () => {
  const unfinishedBook = document.getElementById("incomplete-books");
  unfinishedBook.innerHTML = "";

  const finishedBook = document.getElementById("completed-books");
  finishedBook.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBookInterface(bookItem);

    if (!bookItem.isComplete) {
      unfinishedBook.append(bookElement);
    } else {
      finishedBook.append(bookElement);
    }
  }
});

document.addEventListener(SAVED_EVENT, () => {
  const successBoxContainer = document.getElementById("alert-success-book");
  successBoxContainer.classList.remove("hidden");

  setTimeout(() => {
    successBoxContainer.classList.add("hidden");
  }, 2500);
});
