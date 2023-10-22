# Mini Reddit

The goal was to learn/brush-up my knowledge on the following technologies.

1. [Prisma](https://www.prisma.io/)

2. [tRCP](https://trpc.io/)

3. [TailwindCSS](https://tailwindcss.com/)

## Learnings

- One can go surprisingly far with uncontrolled forms.

    - Keep in mind that you can get the input values directly from the form element.

    - The most problematic part is resetting the form values after successful submission.

        - You most likely want to do this only after a successful submission. This will require you to use the `async` form of the mutation. But, since the mutation is async, the `event.currentTarget` is no longer available – the _event bubbling_ is synchronous!

        - I've noticed that the `event.target` is still available after an async action. I'm unsure how reliable it would be to call `reset` on that element.

- tRPC is quite powerful. It really gives you end-to-end type safety.

    - Having said that, I feel a bit weird about not having dedicated `DTO` or similar package. To me, using TRPC without any additional layer of "data-transport" might cause architectural issues down the line.

    - Since the "router" is modular, one can split the procedures across different files. This also allows for testing each procedure in isolation!

- Prisma is quite flexible. I was able to implement the _nested comments_ relatively quickly.

    - ORMs are quite nice, but one has to understand what kind of queries they are performing underneath. While I trust the authors of Prisma, I would feel safer with having those SQLs statements "visible" in the open.

        - To see what queries Prisma performs, supply the `log` parameter when initializing the client.
