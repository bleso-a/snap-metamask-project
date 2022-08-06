module.exports.onRpcRequest = async ({ origin, request }) => {
  let state = await wallet.request({
    method: 'snap_manageState',
    params: ['get'],
  });
  console.log('state', state);
  if (!state) {
    state = { book: [] };
    await wallet.request({
      method: 'snap_manageState',
      params: ['update', state],
    });
  }

  switch (request.method) {
    case 'addBookForm':
      state.book.push({
        id: request.id,
        title: request.title,
        author: request.author,
        isbn: request.isbn,
        publish_date: request.publish_date,
        number_of_pages: request.number_of_pages,
      });

      await wallet.request({
        method: 'snap_manageState',
        params: ['update', state],
      });
      return true;

    case 'getBookForm':
      return state.book;

    case 'deleteItem':
      state.book = state.book.filter((item) => item.id !== request.id);
      await wallet.request({
        method: 'snap_manageState',
        params: ['update', state],
      });
      return true;

    case 'clearSnaps':
      state.book = state.book.filter((item) => item.id !== request.id);
      await wallet.request({
        method: 'snap_manageState',
        params: ['update', {}],
      });
      return true;

    case 'sendForm':
      const books =
        state && state.book
          ? state.book
              .map((item) => {
                return `${item.title}, ${item.author}, ${item.isbn}`;
              })
              .join('\n')
          : '';
      return wallet.request({
        method: 'snap_confirm',
        params: [
          {
            prompt: `Hello, ${origin}!`,
            description:
              'This custom confirmation is just for display purposes.',
            textAreaContent: books,
          },
        ],
      });
    default:
      throw new Error('Method not found.');
  }
};
