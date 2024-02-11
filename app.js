const express = require("express");
const app = express();
const { Sports,User,Sportname } = require("./models");
const bodyParser = require("body-parser");
const path = require("path");
var csurf = require("tiny-csrf");
var cookieParser= require("cookie-parser");
var passport=require("passport");
var connectEnsureLogin=require("connect-ensure-login");
var session=require("express-session");
var LocalStrategy=require("passport-local");
var bcrypt=require("bcrypt");
const flash=require("connect-flash");
const { request } = require("http");
const { resourceUsage } = require("process");
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("todo application"));
app.use(csurf("this_should_be_32_character_long",["POST","PUT","DELETE"]));
app.set("view engine", "ejs");


app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.use(flash());

app.use(session({
  secret:"the-key-to-future-login-lies-here-84482828282",
  cookie:{
    maxAge: 24*60*60*1000
  }
}));

app.use(function (request,response,next){
  response.locals.messages=request.flash();
  next();
});



function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  } else {
    res.status(401).json({ message: 'Unauthorized user.' });
  }
}

function requirePlayer(req, res, next) {
  if (req.user && req.user.role === 'player') {
    return next();
  } else {
    res.status(401).json({ message: 'Unauthorized user.' });
  }
}



app.use(passport.initialize());
app.use(passport.session());

app.use((request, response, next) => {
  response.locals.messages = request.flash();
  next();
});

const saltRounds = 10;

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  User.findByPk(id).then(user => done(null, user)).catch(error => done(error, null));
});

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
}, async (username, password, done) => {
  try {
    const user = await User.findOne({ where: { email: username } });
    if (user && await bcrypt.compare(password, user.password)) {
      return done(null, user);
    }
    return done(null, false, { message: "Invalid email or password" });
  } catch (error) {
    return done(error);
  }
}));

// Helper Functions
async function registerUser(request, response, role) {
  const { userName, email, password } = request.body;
  if (!userName || !email || !password || password.length < 8) {
    request.flash("error", "Validation failed");
    return response.redirect(role === "admin" ? "/signup/admin" : "/signup/player");
  }

  try {
    const hashedPwd = await bcrypt.hash(password, saltRounds);
    await User.create({
      userName,
      email,
      password: hashedPwd,
      role,
      sessions: "",
    });
    response.redirect("/home");
  } catch (error) {
    request.flash("error", "Email already registered");
    response.redirect(role === "admin" ? "/signup/admin" : "/signup/player");
  }
}

// Routes
app.get('/', (req, res) => res.render("index", { title: "Sports Scheduler", csrfToken: req.csrfToken() }));
app.get('/signup', (req, res) => res.render("signup", { title: "Signup", csrfToken: req.csrfToken() }));
app.get('/signup/admin', (req, res) => res.render("admin-signup", { title: "Admin Signup", csrfToken: req.csrfToken() }));
app.get('/signup/player', (req, res) => res.render("player-signup", { title: "Player Signup", csrfToken: req.csrfToken() }));

app.post("/adminusers", (req, res) => registerUser(req, res, "admin"));
app.post("/playingusers", (req, res) => registerUser(req, res, "player"));

app.get("/signout", connectEnsureLogin.ensureLoggedIn(), (req, res) => {
  req.logout(err => {
    if (err) { return next(err); }
    res.redirect("/");
  });
});



app.post("/addsession", connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  const { title, date, time, location, players: initialPlayers, additional: additionalInput } = request.body;
  const additional = Number(additionalInput);
  const user = await User.findByPk(request.user.id);
  const userEmail = user.email;

  // Validate required fields
  if (!location) {
      request.flash("error", "The location of the session cannot be left blank");
      return response.redirect(`/createsession/${title}`);
  }
  if (isNaN(additional) || additional < 0) {
      request.flash("error", "A session must have at least two players");
      return response.redirect(`/createsession/${title}`);
  }

  // Format players list to include the session creator and convert emails to user IDs
  const playersList = await formatPlayersList(userEmail, initialPlayers);

  try {
      const session = await Sports.create({
          title,
          date,
          time,
          location,
          players: playersList,
          additional,
          userId: user.id
      });

      // Update user's sessions
      const updatedUserSessions = user.sessions ? `${user.sessions},${session.id}` : `${session.id}`;
      await user.update({ sessions: updatedUserSessions });

      response.redirect("/sport/" + title);
  } catch (error) {
      console.log(error);
      request.flash("error", "An error occurred while creating the session.");
      response.redirect(`/createsession/${title}`);
  }
});

async function formatPlayersList(creatorEmail, initialPlayers) {
  const playersEmails = [creatorEmail].concat(initialPlayers.split(',').filter(email => email));
  const playerIds = await Promise.all(playersEmails.map(async (email) => {
      const player = await User.findOne({ where: { email } });
      return player ? player.id.toString() : '';
  }));
  return playerIds.filter(id => id).join(',');
}

app.get("/createsport",requireAdmin,(request,response)=>{
  response.render("createsport",{title:"Create Sport",csrfToken:request.csrfToken()});
});

app.post("/addsport",requireAdmin,async (request,response)=>{
  const title=request.body.title;
  if(title===""){
    request.flash("error","Name of the sport cannot be left blank");
    return response.redirect("/createsport");
  }
  try{
    await Sportname.create({title:title,userId:request.user.id});
    response.redirect("/home");
  }
  catch(error){
    request.flash("error","Sport already exists.");
    response.redirect("/home");
  }
});
// Authentication Middleware
function requireRole(role) {
  return function(req, res, next) {
    if (req.isAuthenticated() && req.user.role === role) {
      next();
    } else {
      res.status(401).send("Unauthorized");
    }
  };
}


app.get("/signin/:type", (request, response) => {
  const { type } = request.params; // "admin" or "player"
  response.render(`${type}-signin`, { title: `${type} Signin`, csrfToken: request.csrfToken() });
});

app.post("/adminsession", passport.authenticate('local', { failureRedirect: '/signin/admin', failureFlash: true }), requireRole('admin'), (request, response) => {
  response.redirect("/home");
});

app.post("/playersession", passport.authenticate('local', { failureRedirect: '/signin/player', failureFlash: true }), requireRole('player'), (request, response) => {
  response.redirect("/home");
});


app.get("/home",connectEnsureLogin.ensureLoggedIn(),async (request,response)=>{
  console.log(request.user.id);
  const acc=await User.findByPk(request.user.id);
  const sessions=acc.sessions;
  const sessionid=sessions==null?[]:sessions.split(",");
  const usersessions=[];
  for(var i=0;i<sessionid.length;i++){
    if(Number(sessionid[i]).toString()!="NaN"&&sessionid[i]!=""&&sessionid[i]!=null){
      const sess=await Sports.findOne({where:{id:sessionid[i]}});
      if(sess){
        const t=new Date().toISOString().split("T");
        const date=t[0];
        console.log(date);
        const time=t[1].substring(0,5);
        const gtime=sess.time;
        if(sess.date==date){
          if(gtime>time){
            usersessions.push(sess);
          }
        }
        else if(sess.date>date){
          usersessions.push(sess);
        }
      }
    }
  }
  const sportslist=await Sportname.findAll();
  const role=acc.role;
  const userName=acc.userName;
  if (request.accepts("html")) {
    response.render("home",{
        userName,
        role,
        sportslist,
        usersessions,
        csrfToken: request.csrfToken(),
    });
  } else {
    response.json({
      userName,
    });
  }
});
// Create Session Route
app.get("/createsession", connectEnsureLogin.ensureLoggedIn(), (request, response) => {
  response.render("createsession", { title: "Create Session", csrfToken: request.csrfToken() });
});

async function formatPlayers(players, creatorEmail) {
  const emails = [creatorEmail].concat(players.split(','));
  const playerIds = await Promise.all(emails.map(email => getUserIdByEmail(email)));
  return playerIds.filter(id => id).join(',');
}

async function getUserIdByEmail(email) {
  const user = await User.findOne({ where: { email } });
  return user ? user.id.toString() : null;
}

app.get("/signin", (request, response) => {
  response.render("signin", { title: "Signin", csrfToken: request.csrfToken() });
});

// Create Sport Route
app.get("/createsport", requireRole('admin'), (request, response) => {
  response.render("createsport", { title: "Create Sport", csrfToken: request.csrfToken() });
});

app.post("/addsport", requireRole('admin'), async (request, response) => {
  const title = request.body.title;
  if (!title) {
    request.flash("error", "Name of the sport cannot be left blank");
    return response.redirect("/createsport");
  }
  try {
    await Sportname.create({ title: title, userId: request.user.id });
    response.redirect("/home");
  } catch (error) {
    request.flash("error", "Sport already exists.");
    response.redirect("/createsport");
  }
});

// Middleware to retrieve and format user's upcoming sessions
async function getUpcomingSessions(sportTitle) {
  const sessions = await Sports.findAll({ where: { title: sportTitle } });
  const currentDate = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toISOString().split('T')[1].substring(0, 5);

  return sessions.filter(session => {
      const sessionDate = session.date;
      const sessionTime = session.time;
      return (sessionDate > currentDate) || (sessionDate === currentDate && sessionTime > currentTime);
  });
}

// Middleware to format session participants
async function formatSessionParticipants(players) {
  const playerIds = players.split(",").filter(id => !isNaN(Number(id)) && id !== "");
  const playerDetails = await Promise.all(playerIds.map(async (id) => {
      const player = await User.findByPk(Number(id));
      return player ? `${player.firstName} ${player.lastName}` : null;
  }));
  return playerDetails.filter(detail => detail !== null);
}

// Sport Sessions Route
app.get("/sport/:sport", connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  const { sport } = request.params;
  const role = request.user.role;
  const upsessions = await getUpcomingSessions(sport);
  
  try {
      const sports = await Sportname.findOne({ where: { title: sport } });
      response.render("sport", {
          sport,
          csrfToken: request.csrfToken(),
          role,
          ses: upsessions,
          userid: request.user.id,
          owner: sports.userId
      });
  } catch (error) {
      console.log(error);
  }
});
// Create Session for a Specific Sport Route
app.get("/createsession/:sport", connectEnsureLogin.ensureLoggedIn(), (request, response) => {
  const sport = request.params.sport;
  response.render("createsession", { title: "Create Session", csrfToken: request.csrfToken(), sport: sport });
});

// Detailed View of a Specific Session
app.get("/session/:id", connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  const id = request.params.id;
  const session = await Sports.findByPk(id);
  const owner = await User.findByPk(session.userId);
  const ownerName = `${owner.userName}`;
  const sport = await Sportname.findOne({ where: { title: session.title } });
  const sportOwner = sport.userId;
  const role = request.user.role;
  const userName = `${request.user.userName}`;
  const playerList = await formatSessionParticipants(session.players);
  
  response.render("session", {
      title: "Session",
      csrfToken: request.csrfToken(),
      session: session,
      role: role,
      userid: request.user.id,
      userName: userName,
      owner: ownerName,
      players: playerList,
      playerid: session.players.split(","),
      sportowner: sportOwner,
      sport: session.title
  });
});

// Join or Leave a Session
app.put("/session/:id", connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  const user = await User.findByPk(request.user.id);
  let userSessions = user.sessions ? user.sessions.split(",") : [];
  const session = await Sports.findByPk(request.params.id);
  let additional = Number(session.additional);
  
  if (request.body.type === "join" && !userSessions.includes(request.params.id.toString())) {
      additional -= 1;
      userSessions.push(request.params.id);
  } else if (request.body.type === "leave") {
      additional += 1;
      userSessions = userSessions.filter(sessionId => sessionId !== request.params.id.toString());
  }

  try {
      await user.update({ sessions: userSessions.join(",") });
      await session.update({ additional: additional });
      response.json({ Success: true });
  } catch (error) {
      console.log(error);
      response.status(422).json(error);
  }
});

// Delete a Session
app.delete("/session/:id", connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  const session = await Sports.findByPk(request.params.id);
  if (session.userId !== request.user.id) {
      request.flash("error", "You are not authorized to delete this session");
      return response.redirect(`/session/${request.params.id}`);
  }
  try {
      await Sports.destroy({ where: { id: request.params.id } });
      response.json({ Success: true });
  } catch (error) {
      console.log(error);
      response.status(422).json(error);
  }
});

// Delete a Sport
app.delete("/sport/:sport",requireAdmin, connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  const sport = await Sportname.findOne({ where: { title: request.params.sport } });
  if (sport.userId !== request.user.id) {
      request.flash("error", "You are not authorized to delete this sport");
      return response.redirect(`/sport/${request.params.sport}`);
  }
  try {
      await Sports.destroy({ where: { title: request.params.sport } });
      await Sportname.destroy({ where: { title: request.params.sport } });
      response.json({ Success: true });
  } catch (error) {
      console.log(error);
      response.status(422).json(error);
  }
});

// Admin Specific Session Update
app.put("/admin/session/:id", requireAdmin, async (request, response) => {
  try {
      const session = await Sports.findByPk(request.params.id);
      await session.update({ players: request.body.player });
      response.json({ Success: true });
  } catch (error) {
      console.log(error);
      response.status(422).json(error);
  }
});

app.get("/sport/:sport/report",requireAdmin,async (request,response)=>{
  const sessions= await Sports.findAll({where:{title:request.params.sport}});
  const upsessions=[];
  const pastsessions=[];
  for(var i=0;i<sessions.length;i++){
      const t=new Date().toISOString().split("T");
      const date=t[0];
      const time=t[1].substring(0,5);
      const gtime=sessions[i].time;
      if(sessions[i].date==date){
        if(gtime>time){
          upsessions.push(sessions[i]);
        }
        else{
          pastsessions.push(sessions[i]);
        }
      }
      else if(sessions[i].date>date){
        upsessions.push(sessions[i]);
      }
      else{
        pastsessions.push(sessions[i]);
      }
  }
  response.render("reports",{csrfToken:request.csrfToken(),pastses:pastsessions,upses:upsessions,sport:request.params.sport});
});

app.get("/session/:id/edit",requireAdmin,(request,response)=>{
  const id=request.params.id;
  response.render("editsession",{title:"Update Session",csrfToken:request.csrfToken(),id:id});
});

app.get("/session/:id/updatesession",requireAdmin,async (request,response)=>{
  const date=request.body.date;
  const time=request.body.time;
  const location=request.body.location;
  var players=request.body.players;
  var addtional=Number(request.body.additional);
  const acc=await User.findByPk(request.user.id);
  const username=acc.email;
  players=username+','+players;
  const playerlist=players.split(',');
  var playerlist1="";
  for(var i=0;i<playerlist.length;i++){
    const player=await User.findOne({where:{email:playerlist[i]}});
    if(player){
      playerlist1=playerlist1+player.id.toString()+',';
    }
  }
  if(location===""||location===undefined){
    request.flash("error","The location of the session cannot be left blank");
    response.redirect(`/session/${request.params.id}/edit`);
  }
  if(addtional===""||addtional===undefined){
    if(players===""||players===undefined){
      request.flash("error","A session must have atleast two players");
      response.redirect(`/session/${request.params.id}/edit`);
    }
  }
  try{
    const session=await Sports.update({date:date,time:time,location:location,players:playerlist1,additional:addtional});
    console.log(addtional);
    var usersess=acc.sessions;
    usersess+=','+session.id;
    await acc.update({sessions:usersess});
    response.redirect("/home");
  }
  catch(error){
    console.log(error);
  }
});



app.get("/login",(request,response)=>{
  response.redirect("/signin");
});

module.exports =app;