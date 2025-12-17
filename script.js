const editor = document.getElementById('scriptInput');
const contentsList = document.getElementById('contentsList');
const addSceneBtn = document.getElementById('addScene');
const exportPDFBtn = document.getElementById('exportPDF');

let sceneCount = 0;
let expectCharacter = true;
const scenes = [];

/* ---------- Add Scene ---------- */
addSceneBtn.addEventListener('click', () => {
  sceneCount++;
  const sceneEl = document.createElement('div');
  sceneEl.className = 'scene-title';
  sceneEl.textContent = `Scene ${sceneCount}`;
  editor.appendChild(sceneEl);

  scenes.push({ title: sceneEl.textContent });
  refreshContents();

  expectCharacter = true;
});

function refreshContents() {
  contentsList.innerHTML = '';
  scenes.forEach((s, i) => {
    const li = document.createElement('li');
    li.textContent = `${i + 1}. ${s.title}`;
    contentsList.appendChild(li);
  });
}

/* ---------- Editor keyboard behaviors ---------- */
editor.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.ctrlKey) {
    e.preventDefault();

    const block = document.createElement('div');
    block.classList.add('line-block');

    if (expectCharacter) {
      const char = document.createElement('div');
      char.classList.add('character-name');
      char.contentEditable = 'true';
      char.setAttribute('data-placeholder', 'Character name');
      block.appendChild(char);
      expectCharacter = false;
    } else {
      const line = document.createElement('div');
      line.classList.add('dialogue-line');
      line.contentEditable = 'true';
      line.setAttribute('data-placeholder', 'Dialogue');
      block.appendChild(line);
      expectCharacter = true;
    }

    editor.appendChild(block);
    placeCaret(block.firstChild);
  }

  if ((e.key === 's' || e.key === 'S') && e.ctrlKey) {
    e.preventDefault();
    const stage = document.createElement('div');
    stage.classList.add('stage-direction');
    stage.contentEditable = 'true';
    stage.setAttribute('data-placeholder', 'Stage direction');
    editor.appendChild(stage);
    placeCaret(stage);
  }
});

/* ---------- PDF export ---------- */
exportPDFBtn.addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Title page
  doc.setFontSize(22);
  doc.text("My Script", 105, 40, { align: "center" });

  // Contents
  doc.addPage();
  doc.setFontSize(16);
  doc.text("Contents", 105, 40, { align: "center" });
  let y = 60;
  scenes.forEach((s, i) => {
    doc.text(`${i + 1}. ${s.title}`, 105, y, { align: "center" });
    y += 14;
  });

  // Script body
  doc.addPage();
  let bodyY = 60;
  [...editor.children].forEach(node => {
    const text = node.textContent.trim();
    if (!text) return;

    if (node.classList.contains('scene-title')) {
      doc.setFont("Times","Bold");
      doc.setFontSize(14);
      doc.text(text, 105, bodyY, { align: "center" });
      bodyY += 24; // spacing after scene title
    }
    else if (node.classList.contains('line-block')) {
      const char = node.querySelector('.character-name');
      const line = node.querySelector('.dialogue-line');

      if (char && char.textContent.trim()) {
        doc.setFont("Times","Bold");
        doc.setFontSize(12);
        doc.text(char.textContent.trim(), 105, bodyY, { align: "center" });
        bodyY += 0; // spacing before dialogue
      }

      if (line && line.textContent.trim()) {
        doc.setFont("Times","Normal");
        doc.setFontSize(12);
        doc.text(line.textContent.trim(), 105, bodyY, { align: "center" });
        bodyY += 16;
      }
    }
    else if (node.classList.contains('stage-direction')) {
      doc.setFont("Times","Italic");
      doc.setFontSize(12);
      doc.text(text, 105, bodyY, { align: "center" });
      bodyY += 16;
    }
    else {
      doc.setFont("Times","Normal");
      doc.setFontSize(12);
      doc.text(text, 105, bodyY, { align: "center" });
      bodyY += 16;
    }
  });

  doc.save("script.pdf");
});

/* ---------- Helpers ---------- */
function placeCaret(el) {
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(el);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
}
