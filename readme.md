# Email Service Challenge

## Installion

### Prerequisites

- [NVM](https://github.com/nvm-sh/nvm#installing-and-updating)

#### First time only - Installing the appropriate Node Version

Once you have `NVM` installed, run the following in your terminal

```sh
nvm install
```

#### Subsequent Visits - Installing the appropriate Node Version

Run the following in your terminal

```sh
nvm use
```

### Installing Dependencies

Install the dependencies using NPM

```sh
npm install
```

## Running the service locally

### Environment Variables

#### PORT: number

The PORT at which to run the server from

#### SENDGRID_API_KEY: string

The API Key provided by SendGrid to send Emails

#### MAILGUN_API_KEY: string

The API Key provided by MailGun to send Emails

#### MAILGUN_DOMAIN: string

The DOMAIN to use when sending emails from MailGun

#### NODE_ENV: string

The configured environment

- 'development'
- 'production'

#### PREFERRED_PROVIDER: 'SendGrid' | 'MailGun'

The preferred email provider to use. If 'SendGrid' is preferred, it will be used to send an email,
but in the case of failure MailGun will be used to send the email.

- 'development'
- 'production'

**Example**

You can place these variables into a `.env` (ignored by .gitignore) and they will be loaded
automatically when starting the server.

```json
PORT=8080
SENDGRID_API_KEY='...'
MAILGUN_API_KEY='...'
MAILGUN_DOMAIN='...'
NODE_ENV='development'
PREFERRED_PROVIDER='SendGrid'
```

### Start the server

After installing the dependencies and configuring your environment variables in the terminal run the
following

```sh
npm start
```

You can now communicate with the server utilizing the specified API.

## API

### [POST] /email

This endpoint will

### Example Request Body

```json
{
  "to": "from@example.com",
  "to_name": "From Name",
  "from": "to@example.com",
  "from_name": "To Name",
  "subject": "Cool Things",
  "body": "<h1>Your Bill</h1><p>$10</p>"
}
```

### Example Response Body

```json
{
  "id": "eca72fed-7be3-406e-aa2c-ceb728a47666",
  "created": "2021-08-02T02:15:02.392Z",
  "subject": "Cool Things",
  "body": "<h1>Your Bill</h1><p>$10</p>",
  "from": {
    "email": "from@example.com",
    "name": "From Name"
  },
  "to": {
    "email": "to@example.com",
    "name": "To Name"
  }
}
```

## Postman Collection

A postman collection for the endpoint can be found [here](./v1.postman_collection.json) along with a
sample postman environment [here](./v1.postman_environment.json). You'll need to override the
`FROM_EMAIL` and `TO_EMAIL` variables to get things working.

## The choices I have made

I have chosen to implement this exercise utilizing the following tools

- [TypeScript](https://www.typescriptlang.org/)
- [Node.js](https://nodejs.org)
- [Express](https://expressjs.com/)
- [FP-TS](https://gcanti.github.io/fp-ts/)
- [@typed/fp](https://github.com/TylorS/typed-fp)

Given the time constraints, I made most of my decisions based on familiarity so I could focus more
on the task at hand and avoid learning too much at the same time.

Beyond familiarity, I will often choose TypeScript for its very expressive type system. I find the
design of an application starts from a well-designed Domain Model. TypeScript has many powerful
constructs from type-level computations, which can lower boilerplate in larger applications. While
teaching the compiler new information, you gain a friend that will check each condition infallibly
upon every compile to ensure we're not shipping bugs to our customers.

Node.js is mainly the logical choice for a server written in TypeScript today.

In regards to `fp-ts` and `@typed/fp`; I'm an active community member of the `fp-ts` project, and
I'm the author of `@typed/fp`; an extension of `fp-ts` with Async effects that support cancelation,
Streams, and other cool data structures and constructs that I've found useful when building
applications over the past few years.

I'm a strong proponent of Functional Programming. Many of us can readily agree that composition is a
powerful tool for us programmers. Composition is at the core of functional programming. In a
language with first-class functions, like JS/TS, higher-order functions begin to appear everywhere.
These patterns lead you to data structures favoring composition that also work to rule out
impossible states. You'll see `Either` utilized in this application a fair amount, used for
branching like `try/catch` or `if/else`.

I'm also a proponent of
[Domain-Driven Design](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf).
I'm still learning myself, but one piece of DDD I relate to is that a true Domain Expert will
understand the systems as they should function much better than anyone who is not also a Domain
Expert. DDD is all about making your software systems deeply reflect real-world systems. It can
impact the way you plan, as there are methods of planning such as
[Event Storming](https://en.wikipedia.org/wiki/Event_storming) to utilize product-level knowledge to
create shared understanding between the business and the engineering org while also outputting
information directly tangible in code.

If you're familiar with DDD, then you'll likely quickly notice the architecture here is not _quite_
the same as often referred to in the mostly OO-based examples of layered architecture. After reading
[DDD Made Functional](https://pragprog.com/titles/swdddf/domain-modeling-made-functional/) and
practicing FP w/ DDD for multiple years, I've come to a system pretty similar to Clean
Architecture -

![Clean Architecture](./clean-archiecture.png?raw=true)

Listed from "bottom" to the "top" the layers are as following

- Domain
  - Responsible for the core data contracts that represent our domain
  - Used as a shared abstraction between the application + infrastructure layer
  - Usually types, sometimes some constructors or predicates/refinements
- Application
  - Responsible for algorithms and logic
  - Unit-Tested
  - Utilizes
    [Dependency Inversion](https://javascript.plainenglish.io/decoupling-code-in-javascript-with-the-dependency-inversion-principle-6d23342b4aaa)
    to lift side-effects away from the core logic, deferring such choices to the Infrastructure
- Infrastructure
  - Responsible for all side-effects, HTTP, persistence, etc
  - Unit or Integration Tested
  - Environment-aware
- Composition
  - Responsible for composing the other layers into a running whole.
  - Integration/Functional testing

This architecture accounts for its separation of concerns rigorously, which lends itself to testing
and maintenance.

## Additional Thoughts

- I spent about 3.5 hours working on the problem and about an hour writing this README
- With some more time, I'd likely have created an internal representation of a Request/Response such
  that each endpoint handler would implement them an abstract the application layer further away
  from the environment in which it is running, making it easy to switch from Express to AWS Lambda
  to whatever else.
- If this were going to production, I'd setup CI/CD using something like
  [CircleCI](https://circleci.com/)
