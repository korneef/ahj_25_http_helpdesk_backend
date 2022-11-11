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
    "status": true,
    "date": 1667911504252,
    "id": 60014
  }
]

const ticketsFull = [
  {
    "name": "ticket1",
    "status": true,
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
      ctx.response.body = JSON.stringify(tickets);
      return;
    case 'ticketById':
      const id = ctx.request.query.id;
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
      ctx.response.body = ticket;
      return
    case 'editTicket':
      const editedId = ctx.request.body.id;
      if (!isNaN(Number(editedId))) {
        let ticket = tickets.find((item) => item.id === Number(editedId));
        let ticketFull = ticketsFull.find((item) => item.id === Number(editedId));
        if (ticket !== undefined && ticketFull !== undefined) {
          ticket.name = ctx.request.body.name;
          ticketFull.name = ctx.request.body.name;
          ticket.description = ctx.request.body.description;
          ticketFull.description = ctx.request.body.description;
          ctx.response.status = 200;
          ctx.response.body = ticketFull;
          return
        }
      }
    case 'deleteTicket':
      const ticketDeleteId = ctx.request.body.id;
      const ticketIndex = tickets.findIndex((item) => Number(item.id) === Number(ticketDeleteId));
      const ticketFullIndex = ticketsFull.findIndex((item) => Number(item.id) === Number(ticketDeleteId));
      if (ticketIndex !== -1 && ticketFullIndex !== -1) {
        tickets.splice(ticketIndex, 1);
        ticketsFull.splice(ticketFullIndex, 1);
        ctx.response.status = 200;
        ctx.response.body = ticketDeleteId;
        return
      } else {
        ctx.response.status = 404;
        return
      }
      case 'checkboxChange':
        const ticketCheckboxId = ctx.request.body.id;
        if (!isNaN(Number(ticketCheckboxId))) {
          let ticket = tickets.find((item) => item.id === Number(ticketCheckboxId));
          let ticketFull = ticketsFull.find((item) => item.id === Number(ticketCheckboxId));
          if (ticket !== undefined && ticketFull !== undefined) {
            if (ctx.request.body.status === 'true') {
              ticket.status = true;
              ticketFull.status = true;
            } else {
              ticket.status = false;
              ticketFull.status = false; 
            }
            ctx.response.status = 200;
            return
          }
        }
  }

  ctx.response.status = 404;
  return
});
const port = process.env.PORT || 7070;
const server = http.createServer(app.callback()).listen(port);