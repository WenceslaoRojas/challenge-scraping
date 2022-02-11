const { default: axios } = require("axios");
const { Router } = require("express");
const router = Router();
const { Post } = require("../db");
const moment = require("moment");
const cheerio = require("cheerio");
router.use(async function (req, res, next) {
  const urlTemp = {};
  let PostsInternational = [];
  let PostsInnovation = [];
  let verification = await Post.findAll();
  if (verification.length > 0) return next();
  try {
    // se busca el link de las categorías "innovation" y "international-logistics"
    await axios.get("https://cargofive.com/blog/").then((urlResponse) => {
      const $ = cheerio.load(urlResponse.data);
      $("span.meta-category").each((i, element) => {
        const link = $(element).find("a").attr("href");
        if (link.includes("innovation") && !urlTemp.innovation)
          urlTemp.innovation = link;
        if (link.includes("international") && !urlTemp.international)
          urlTemp.international = link;
      });
    });
    // se recolectan las urls de los 3 primeros post
    async function searchURLPost(urlCategory, flag) {
      await axios.get(urlCategory).then((urlResponse) => {
        const $ = cheerio.load(urlResponse.data);
        $("div.post-content-wrap").each((i, element) => {
          const link = $(element).find("a.entire-meta-link").attr("href");
          flag === "international"
            ? PostsInternational.push(link)
            : PostsInnovation.push(link);
        });
      });
    }
    //Busca las URL de los  post de ambas categorías.
    console.log(urlTemp.international, urlTemp.innovation);
    await searchURLPost(urlTemp.international, "international");
    await searchURLPost(urlTemp.innovation, "innovation");

    //Arreglo para mantener los post totales, y asi poder evaluar cuales son los 3 mas recientes.
    let tempPosts = [];
    //Función que guarda los post mas recientes en la DB
    function saveDb() {
      tempPosts.forEach(async (dataPost) => {
        await Post.create({
          title: dataPost.title,
          publishedAt: dataPost.publishedAt,
          sourceLink: dataPost.sourceLink,
          author: dataPost.author,
          category: dataPost.category,
          bodyDescription: dataPost.bodyDescription,
        });
      });
      tempPosts = [];
    }

    //function llamada con setTimeOut.
    function selectPost() {
      // ordena y deja los 3 post mas recientes.
      tempPosts.sort(function compare(a, b) {
        if (moment(a.publishedAt).isBefore(b.publishedAt)) return 1;
        if (moment(a.publishedAt).isAfter(b.publishedAt)) return -1;
        return 0;
      });
      tempPosts = tempPosts.slice(0, 3);
      //llama a la función con los tres últimos post
      saveDb();
    }

    //función que extrae la información de los post en cada categoría.
    async function searchInfoPost(arrayOfPost) {
      arrayOfPost.map(async (urlPost) => {
        let newPost = { sourceLink: urlPost };
        await axios.get(urlPost).then((urlResponse) => {
          const $ = cheerio.load(urlResponse.data);
          $("h1.entry-title").each((i, element) => {
            const link = $(element).text();
            newPost.title = link;
          });
          $("span.fn").each((i, element) => {
            const link = $(element).find("a").text();
            newPost.author = link;
          });
          $("span.date").each((i, element) => {
            const link = $(element).text();
            newPost.publishedAt = link;
          });
          $("span.meta-category").each((i, element) => {
            const link = $(element).find("a").text();
            newPost.category = link;
          });
          $("div.content-inner").each((i, element) => {
            const link = $(element).find("h1").text();
            newPost.bodyDescription = link;
          });
          tempPosts.push(newPost);
        });
      });
      //Se espera 1 seg por cada post que se debe extraer información, y luego se llama a la función que ordenará y seleccionará los post mas recientes.
      setTimeout(selectPost, arrayOfPost.length * 1000);
    }
    //Llamado a la función que extrae info de cada post con los arreglos de cada categoría
    await searchInfoPost(PostsInternational);
    setTimeout(function () {
      searchInfoPost(PostsInnovation);
    }, PostsInternational.length * 1000);
    return next();
  } catch (err) {
    console.log(err);
    res.status(404).send(err);
  }
});

module.exports = router;
