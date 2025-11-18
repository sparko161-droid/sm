export default {
  name: "results",

  async init(container) {
    container.innerHTML = `
      <section class="page page--results">
        <h1>Результаты квизов</h1>
        <p>Позже здесь будет история прохождений из localStorage.</p>
      </section>
    `;
  },

  destroy() {}
};
