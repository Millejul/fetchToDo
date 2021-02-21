const $textArea = document.getElementById('todo-input');
const $saveBtn = document.getElementById('save-btn');
const $todoList = document.getElementById('todo-list');
const $todoCount = document.getElementById('todo-count');
const $doneList = document.getElementById('done-list');
const $doneCount = document.getElementById('done-count');
const $clearAllBtn = document.getElementById('clear-all-btn');

const state = {
  focusIndex: NaN,
  todoList: [],
  doneList: [],
};

function setState() {
  fetch(
    'https://phpstack-224488-1624928.cloudwaysapps.com/_/items/todo?filter%5Bdone%5D%5Beq%5D=0',
    {
      method: 'GET',
      headers: {
        Authorization: 'bearer ABcEHA2kcrKY4a6ipUA3',
      },
    },
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error('could not fetch todoItems');
      }

      return response.json();
    })
    .then(function (body) {
      state.todoList = body.data;
      printTodoList();
      disableBtns(false);
    })
    .catch((err) => {
      console.error(err);
    });
}

function doneState() {
  fetch(
    'https://phpstack-224488-1624928.cloudwaysapps.com/_/items/todo?filter%5Bdone%5D%5Beq%5D=1&=',
    {
      method: 'GET',
      headers: {
        Authorization: 'bearer ABcEHA2kcrKY4a6ipUA3',
      },
    },
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error('could not fetch done todoItems');
      }

      return response.json();
    })
    .then(function (body) {
      state.doneList = body.data;
      printDoneList();
    })
    .catch((err) => {
      console.error(err);
    });
}

function printTodoList() {
  $todoList.innerHTML = '';
  let template = '';

  for (let i = 0; i < state.todoList.length; i++) {
    template += `<div class="box ${
      i === state.focusIndex ? 'active' : ''
    }" data-index="${i}" data-id="${state.todoList[i].id}">
      <p>${state.todoList[i].description}</p>
      <a class="done-btn fas fa-check-circle fa-2x"></a>
    </div>`;
  }

  $todoList.insertAdjacentHTML('beforeend', template);
  $todoCount.innerText = state.todoList.length;
}

function printDoneList() {
  $doneList.innerHTML = '';
  let template = '';

  for (let i = 0; i < state.doneList.length; i++) {
    template += `<div class="box ${
      i === state.focusIndex ? 'active' : ''
    }" data-index="${i}" data-id="${state.doneList[i].id}">
    <p>${state.doneList[i].description}</p>
    <a class="remove-btn fas fa-times-circle fa-2x" data-index="${i}"></a>
  </div>`;
  }

  $doneList.insertAdjacentHTML('beforeend', template);
  $doneCount.innerText = state.doneList.length;
}

function updateBtnClicked(id, curIndex) {
  const body = {
    done: true,
  };
  fetch(
    `https://phpstack-224488-1624928.cloudwaysapps.com/_/items/todo/${id}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: 'bearer ABcEHA2kcrKY4a6ipUA3',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error('could not update todoItem');
      }
      return response.json;
    })
    .then(function () {
      const doneItem = state.todoList.splice(curIndex, 1);
      state.doneList.push(doneItem[0]);
      deleteLoadingBtn($clearAllBtn);
      printTodoList();
      printDoneList();
    })
    .catch((err) => {
      console.error(err);
    });
}

function saveBtnClicked() {
  insertLoadingBtn($saveBtn);
  const body = {
    description: $textArea.value,
    done: false,
  };
  fetch('https://phpstack-224488-1624928.cloudwaysapps.com/_/items/todo', {
    method: 'POST',
    headers: {
      Authorization: 'bearer ABcEHA2kcrKY4a6ipUA3',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('could not save todoItem');
      }

      return response.json();
    })

    .then(function (body) {
      console.log(body);
      $textArea.value = '';
      state.todoList.push(body.data);
      deleteLoadingBtn($saveBtn);
      printTodoList();
    })
    .catch((err) => {
      console.error(err);
    });
}

function deleteBtnClicked(id, curIndex) {
  fetch(
    `https://phpstack-224488-1624928.cloudwaysapps.com/_/items/todo/${id}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: 'bearer ABcEHA2kcrKY4a6ipUA3',
      },
    },
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error('could not delete todoItem');
      }
      return;
    })
    .then(function () {
      state.doneList.splice(curIndex, 1);
      printDoneList();
    })
    .catch((err) => {
      console.error(err);
    });
}

function todoListClicked(event) {
  const $target = event.target;

  if ($target.matches('.done-btn')) {
    const curId = $target.closest('.box').dataset.id;
    const curIndex = $target.closest('.box').dataset.index;
    updateBtnClicked(curId, curIndex);
    // state.doneList = state.doneList.concat(doneItem); // alternatief
  }

  if ($target.matches('.box') || $target.matches('.box p')) {
    const curIndex = parseInt($target.closest('.box').dataset.index);
    state.focusIndex = curIndex === state.focusIndex ? NaN : curIndex;

    printTodoList();
  }
}

function disableBtns(status) {
  $clearAllBtn.disabled = status;
  $saveBtn.disabled = status;
  // $doneBtn = document.getElementsByClassName('done-btn');
  // $removeBtn = document.getElementsByClassName('remove-btn');

  // knopUit($doneBtn, status);
  // knopUit($removeBtn, status);
}

// function knopUit(btn, status) {
//   for (let i = 0; i < btn.length; i++) {
//     btn[i].disabled = status;
//   }
// }

function insertLoadingBtn(btn) {
  btn.classList.add('buttonload');
  btn.innerHTML = `<i class="fa fa-spinner fa-spin"></i>Loading`;
  disableBtns(true);
}

function deleteLoadingBtn(btn) {
  btn.classList.remove('buttonload');
  btn.innerHTML = `save`;
  disableBtns(false);
}

function doneListClicked(event) {
  const $target = event.target;

  if ($target.matches('.remove-btn')) {
    const curIndex = $target.dataset.index;
    const curId = $target.closest('.box').dataset.id;
    deleteBtnClicked(curId, curIndex);
  }
}

function changeAlltasks() {
  insertLoadingBtn($clearAllBtn);
  state.todoList.forEach(function (currVal) {
    console.log(currVal);
    updateBtnClicked(currVal.id, 0);
  });
}

$saveBtn.addEventListener('click', saveBtnClicked);
$todoList.addEventListener('click', todoListClicked);
$doneList.addEventListener('click', doneListClicked);
$clearAllBtn.addEventListener('click', changeAlltasks);

setState();
doneState();
