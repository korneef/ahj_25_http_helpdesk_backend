const { urlencoded } = require('body-parser');
const http = require('http');
const Koa = require('koa');
const { koaBody } = require('koa-body');
const app = new Koa();

app.use(koaBody({
  urlencoded: true,
}));

const tickets = [
  {
    "name": "ticket1",
    "status": false,
    "date": 1667911504252,
    "id": 60014
  }
]

const ticketsFull = [
  {
    "name": "ticket1",
    "status": false,
    "date": 1667911504252,
    "description": 'this is ticket1 description',
    "id": 60014
  }
]

class Ticket {
  constructor(name) {
    this.name = name;
    this.status = false
    this.date = Date.now();
  }
  setId(array) {
    let newId = Math.round(Math.random() * 100000)
    let checkId = array.some(element => element.id === newId)
    while (checkId) {
      newId = Math.round(Math.random() * 100000);
      checkId = array.some(element => element.id === newId);
    }
    this.id = newId;
    return newId;
  }
}

class TicketFull extends Ticket {
  constructor(name, description) {
    super(name)
    this.description = description;
  }
}

app.use(async ctx => {
  ctx.response.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'X-Secret, Content-Type'
  });

  const method = ctx.request.method;
  let process = null;

  switch (method) {
    case 'GET':
      process = ctx.request.query.process;
      break
    case 'POST':
      process = ctx.request.body.process;
      break
    default:
      ctx.response.status = 404;
      return;
  }

  switch (process) {
    case 'allTickets':
      ctx.response.body = tickets;
      return;
    case 'ticketById':
      const id = ctx.request.query.id
      if (!isNaN(Number(id))) {
        let ticket = ticketsFull.find((item) => item.id === Number(id));
        if (ticket) {
          ctx.response.body = ticket;
          return
        }
      }
      ctx.response.status = 404;
      return
    case 'createTicket':
      const ticketName = ctx.request.body.name;
      const ticketDescription = ctx.request.body.description;
      const ticket = new Ticket(ticketName)
      const ticketId = ticket.setId(tickets);
      tickets.push(ticket);
      const ticketFull = new TicketFull(ticketName, ticketDescription)
      ticketFull.id = ticketId;
      ticketsFull.push(ticketFull);

      ctx.response.status = 200;
      return
  }

  ctx.response.status = 404;
  return
});

const server = http.createServer(app.callback()).listen(7070);