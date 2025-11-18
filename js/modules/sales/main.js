export default {
  name: "sales",

  async init(container) {
    container.innerHTML = `
      <section class="page page--sales">
        <h1>Sales</h1>
        <p>Здесь позже будет контент sales из оригинального проекта.</p>
      </section>
    `;
  },

  destroy() {}
};
