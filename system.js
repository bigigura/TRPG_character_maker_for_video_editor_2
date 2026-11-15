/* display system */
const btn = document.getElementById('toggleBtn');
const target1 = document.getElementById('targetElement1');
const target2 = document.getElementById('targetElement2');

btn.addEventListener('click', () => {
  target1.classList.toggle('hidden');
  target2.classList.toggle('hidden');
});

/* image system */
const imageInput = document.querySelector('.imageInput');
const preview = document.querySelector('.preview');

document.querySelector('.image-picker-zone')
  .addEventListener('click', () => {
    imageInput.click();
  });

imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = (event) => {
      preview.src = event.target.result;
      preview.style.display = 'block';
    };

    reader.readAsDataURL(file);
  }
});

/* status and skills */
const statFields = [...document.querySelectorAll('.status')];
const [str, con, pow, dex, , siz, int, edu] = statFields;
const statInputs = { str, con, pow, dex, siz, int, edu };
const has = input => input.value.trim() !== '';

/* skills */
const skillContainers = document.querySelectorAll('.skill-list');

function createNumberInput(Name,type) {
  const input = document.createElement('input');

  input.type = type;
  input.className = 'text left with_bottom_border ' + Name;

  return input;
}

function addSkillRow(container) {
  const row = document.createElement('div');
  row.className = 'skill-row';

  const select = createNumberInput('skill-select','text');

  const successPoints = createNumberInput('success-points','number');

  row.append(
    select,
    successPoints
  );

  container.appendChild(row);
}

skillContainers.forEach(container => {
  for (let i = 0; i < 10; i++) {
    addSkillRow(container, i);
  }
});

/* status */
const derived = Object.fromEntries(['luck', 'hp', 'mp', 'san', 'indefinite', 'idea', 'knowledge', 'mov', 'db', 'build', 'job-point', 'interest-point'].map(id => [id, document.getElementById(id)]));

function updateDerivedStats() {
  const { str, con, pow, dex, siz, int, edu } = Object.fromEntries(Object.entries(statInputs).map(([key, input]) => [key, Number(input.value)]));

  derived['hp'].value = has(statInputs.con) && has(statInputs.siz) ? Math.floor((con + siz) / 10) : '';

  derived['mp'].value = has(statInputs.pow) ? Math.floor(pow / 5) : '';

  derived['san'].value = has(statInputs.pow) ? pow + '/99' : '';

  derived['idea'].value = has(statInputs.int) ? int : '';

  derived['knowledge'].value = has(statInputs.edu) ? edu : '';

  if (has(statInputs.str) && has(statInputs.dex) && has(statInputs.siz)) {
    let mov = str < siz && dex < siz ? 7 : str > siz && dex > siz ? 9 : 8;
    derived['mov'].value = mov;
  } else {
    derived['mov'].value = '';
  }

  if (has(statInputs.str) && has(statInputs.siz)) {
    const total = str + siz;
    let db;
    let build;

    if (total <= 64) {
      db = '−2';
      build = -2;
    } else if (total <= 84) {
      db = '−1';
      build = -1;
    } else if (total <= 124) {
      db = '0';
      build = 0;
    } else if (total <= 164) {
      db = '+1D4';
      build = 1;
    } else if (total <= 204) {
      db = '+1D6';
      build = 2;
    } else {
      const tier = Math.floor((total - 125) / 80);
      const dice = Math.floor((total - 125) / 80);
      db = `+${dice}D6`;
      build = tier + 1;
    }

    derived['db'].value = db;
    derived['build'].value = build;
  } else {
    derived['db'].value = '';
    derived['build'].value = '';
  }

}

Object.values(statInputs).forEach(input =>
  input.addEventListener('input', updateDerivedStats)
);

function updateLuck() {
  const roll = () => Math.floor(Math.random() * 6) + 1;
  derived['luck'].value =
    (roll() + roll() + roll()) * 5;
}

Object.values(statInputs).forEach(input => {
  input.addEventListener('change', updateLuck);
});

function updateIndefinite() {
  const san = derived['san'].value.trim().split('/')[0];
  derived['indefinite'].value = san !== '' ? Math.floor(Number(san) * 4 / 5) : '';
}

derived['san'].addEventListener('input', updateIndefinite);
statInputs.pow.addEventListener('input', updateIndefinite);

updateDerivedStats();
derived['indefinite'].value = derived['san'].value.trim() !== '' ? Math.floor(Number(derived['san'].value) * 4 / 5) : '';

/* inport data */
const loadDataButton = document.getElementById('loadData');
const loadFileInput = document.getElementById('loadFile');

loadDataButton.addEventListener('click', () => {
  loadFileInput.click();
});

loadFileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const json = JSON.parse(await file.text());

    loadSelectedData(json);

  } catch (error) {
    console.error(error);
    alert('JSONファイルの読み込みに失敗しました。');
  }

  loadFileInput.value = '';
});


function loadSelectedData(json) {

  const inputs = json.inputs;

  if (!Array.isArray(inputs)) {
    throw new Error('JSONのinputsが見つかりません。');
  }

  const characterName = document.querySelector(
    'input[placeholder="キャラ名"]'
  );

  if (characterName) {
    characterName.value = inputs[0]?.value ?? '';
  }

  const characterKana = document.querySelector(
    'input[placeholder="ふりがな"]'
  );

  if (characterKana) {
    characterKana.value = inputs[1]?.value ?? '';
  }

  const statInputs = [
    ...document.querySelectorAll('.status')
  ];

  for (let i = 0; i < 8; i++) {
    if (statInputs[i]) {
      statInputs[i].value = inputs[11 + i]?.value ?? '';
    }
  }

  const derivedIds = [
    'luck',
    'hp',
    'mp',
    'san',
    'indefinite',
    'idea',
    'knowledge',
    'mov',
    'db',
    'build'
  ];

  derivedIds.forEach((id, i) => {
    const element = document.getElementById(id);

    if (element) {
      element.value = inputs[19 + i]?.value ?? '';
    }
  });

  const weaponInputs = [
    ...document.querySelectorAll('.weapons')
  ];

  for (let i = 0; i < 3; i++) {
    if (weaponInputs[i]) {
      weaponInputs[i].value = inputs[171 + i]?.value ?? '';
    }
  }

  const savedSkills = [];

  inputs.forEach((item, index) => {

    if (item.className?.includes('skill-select')) {

      savedSkills.push({
        name: item.selectedText || '',
        detailSelect: inputs[index + 1],
        detailInput: inputs[index + 2],

        successValue:
          Number(inputs[index + 3]?.value || 0) +
          Number(inputs[index + 4]?.value || 0) +
          Number(inputs[index + 5]?.value || 0) +
          Number(inputs[index + 6]?.value || 0)
      });

    }

  });

  const skillRows = [
    ...document.querySelectorAll('.skill-row')
  ];

  savedSkills.forEach((skill, i) => {

    const row = skillRows[i];

    if (!row) return;

    const select = row.querySelector('.skill-select');
    const successInput = row.querySelector('.success-points');

    if (!select) return;

    const detailName =
      skill.detailSelect?.selectedText || '';

    const detailText =
      skill.detailInput?.value || '';

    let skillName = skill.name || '';

    if (detailName) {
      skillName += `${detailName}`;
    }
    else if (detailText) {
      skillName += `${detailText}`;
    }

    select.value = skillName;

    if (successInput) {
      successInput.value = skill.name
        ? skill.successValue
        : '';
    }

  });

  const preview = document.querySelector('.preview');

  if (preview && json.image) {
    preview.src = json.image;
    preview.style.display = 'block';
  }

}

/* save photo */
document.getElementById("saveImage").addEventListener("click", async () => {

  if (preview.src) {
    try {
      await preview.decode();
    } catch (error) {
      console.warn("画像の読み込みに失敗しました", error);
    }
  }

  await document.fonts.ready;

  const canvas = await html2canvas(document.body, {
    scale: 2,
    backgroundColor: null,
    useCORS: true,
    allowTaint: false,

    width: document.documentElement.scrollWidth,
    height: 630,

    windowWidth: document.documentElement.scrollWidth,
    windowHeight: 800,

    scrollX: 0,
    scrollY: 0,

    onclone: (clonedDoc) => {
      function replaceInputWithText(input) {
        const style = getComputedStyle(input);
        const label = clonedDoc.createElement('div');

        label.textContent = input.value;

        [
          'position',
          'left',
          'top',
          'width',
          'height',
          'boxSizing',
          'fontFamily',
          'fontSize',
          'fontWeight',
          'color',
          'textAlign',
          'transform',
          'border',
          'borderBottom',
          'backgroundColor'
        ].forEach(property => {
          label.style[property] = style[property];
        });

        label.style.display = 'flex';
        label.style.alignItems = 'center';
        label.style.justifyContent = 'center';
        label.style.lineHeight = '1.4';
        label.style.padding = '4px 0';
        label.style.overflow = 'visible';
        label.style.whiteSpace = 'nowrap';
        label.style.backgroundColor = 'transparent';

        label.style.height = '44px';

        input.replaceWith(label);
      }

      function replaceSkillWithText(input) {
        const style = getComputedStyle(input);
        const label = clonedDoc.createElement('div');

        label.textContent = input.value;

        [
          'position',
          'left',
          'top',
          'width',
          'height',
          'boxSizing',
          'fontFamily',
          'fontSize',
          'fontWeight',
          'color',
          'textAlign',
          'transform',
          'border',
          'borderBottom',
          'backgroundColor'
        ].forEach(property => {
          label.style[property] = style[property];
        });

        label.style.display = 'flex';
        label.style.alignItems = 'center';
        label.style.justifyContent = 'left';
        label.style.lineHeight = '28px';
        label.style.padding = '0';
        label.style.overflow = 'visible';
        label.style.whiteSpace = 'nowrap';
        label.style.backgroundColor = 'transparent';

        label.style.height = '28px';

        input.replaceWith(label);
      }

      clonedDoc.querySelectorAll(
        'input[placeholder="キャラ名"]'
      ).forEach(replaceInputWithText);

      clonedDoc.querySelectorAll(
        '.status'
      ).forEach(replaceInputWithText);

      clonedDoc.querySelectorAll(
        '.weapons'
      ).forEach(replaceSkillWithText);
      
      clonedDoc.querySelectorAll(
        ".skill-row .skill-select"
      ).forEach(replaceSkillWithText);

      clonedDoc.querySelectorAll(
        ".skill-row .success-points"
      ).forEach(replaceSkillWithText);

      const clonedPreview = clonedDoc.querySelector(".preview");
      const clonedZone = clonedDoc.querySelector(".image-picker-zone");

      if (clonedPreview && clonedZone && preview.naturalWidth > 0 && preview.naturalHeight > 0) {
        const boxWidth = clonedZone.clientWidth;
        const boxHeight = clonedZone.clientHeight;

        const scale = Math.max(boxWidth / preview.naturalWidth, boxHeight / preview.naturalHeight);

        clonedPreview.style.width = (preview.naturalWidth * scale) + "px";

        clonedPreview.style.height = (preview.naturalHeight * scale) + "px";

        clonedPreview.style.maxWidth = "none";
        clonedPreview.style.maxHeight = "none";
        clonedPreview.style.flex = "none";
        clonedPreview.style.objectFit = "fill";
      }
    }
  });
  const link = document.createElement("a");
  link.download = "キャラシ.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});