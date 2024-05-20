# Waku Services TypeScript Project

This project sets up and manages two Waku services using Docker and Docker Compose. The services are connected via a custom Docker network and are configured to check connectivity between each other.

## Prerequisites

- Node.js and npm
- Docker and Docker Compose

## Setup

### Install Dependencies

First, install the necessary dependencies:

```bash
npm install
npm test
```

#### Notes

As the purpose of the exercise was to check the validity and efficacy of the tests I neglected to include a 'start or run' cmd. This can easily be implemented of course.
In a real world scenario I would add a lot more tests eg Different messages, a third node, negative testing (ensure node fails gracefully, restart node and ensure it reconnects, invalid messages, timeouts etc etc). In my experience negative testing is massively overlooked.
I have almost zero experience of Rust and actual zero experience of Nim so i elected to use TS (Golang was not mentioned as an option). Jest is my preferred testing framework over mocha and Axios is my first choice for rest calls. I considered using 1 docker compose file. With one file i would exec into the container and set the enrUri but i try to avoid using exec functions in tests as in my experience they can be flakey and other QAs are often confused by them.
