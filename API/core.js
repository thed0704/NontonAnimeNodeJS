const axios = require("axios");
const { URLSearchParams } = require("url");
const JSSoup = require("jssoup").default;

class OD{
    constructor(){
        this.url = "https://otakudesu.ltd"
    }

    async get(url, ua){
        let useragent = ua === "" ? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.5249.62 Safari/537.36" : ua;
        let promise = new Promise((resolve) => {
            axios.get(url, {headers : 
                {'User-Agent' : useragent
            }}).then((res) => {
                resolve(res.data)
            }).catch((err) => {
                resolve("")
            })
        })

        let data = await promise

        return data
    }

    async post(url, data, ua){
        let useragent = ua === "" ? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.5249.62 Safari/537.36" : ua;
        let promise = new Promise((resolve) => {
            axios.post(url, data, {headers :
                {"User-Agent" : useragent
            }}).then((res) => {
                resolve(res.data)
            }).catch((err) => {
                resolve("")
            })
        })

        let data_ = await promise

        return data_
    }

    async search(q){
        let query = q
        let result = await this.get(this.url+"/?s="+query+"&post_type=anime", "")
        let data = []
        result = new JSSoup(result)
        result = await result.find("ul", "chivsrc")
        result = await result.findAll("li")

        await result.map(async (d, index) => {
            let img = Buffer.from(d.find("img").attrs.src).toString("base64")
            let href = Buffer.from(d.find("a").attrs.href).toString("base64")
            let title = d.find("a").text
            let sets = d.findAll("div", "set")

            let genre = sets[0].findAll("a")
            let genres = []
            await genre.map((j, i) => {
                genres.push(j.text)
            })

            let status = sets[1].text.replace("Status : ", "").trim()
            let rating = sets[2].text.replace("Rating : ", "").trim()

            rating = rating === "" ? "Unrated" : rating;

            let item = {
                title: title,
                anime_id: href,
                img: img, 
                genre: genres,
                status: status,
                rating: rating
            }

            data.push(item)
        })

        return data
    }

    async get_episode_list(href){
        href = Buffer.from(href, "base64").toString("ascii")
        let batch = {}
        let episode = []
        let result = await this.get(href, "")
        result = new JSSoup(result)
        result = result.findAll("div", "episodelist")

        await result.map(async (i, index) =>{
            let monktit = i.find("span", "monktit").text
            if(/Batch/.test(monktit)){
                let l = i.find("a")
                if(l != null){
                    batch = {
                        text: i.find("a").text,
                        batch_id: Buffer.from(i.find("a").attrs.href).toString("base64")
                    }
                }
            }
            else{
                let eps = i.findAll("a")
                await eps.map((j, index_) => {
                    let text = j.text
                    let href_ = Buffer.from(j.attrs.href).toString("base64")
                    let eps_ = {
                        text: text,
                        episode_id: href_
                    }

                    episode.push(eps_)
                })
            }
        })

        let bundle = {
            episode_list: episode,
            batch: batch
        }
        return bundle
    }

    async get_nonce(){
        let action = "aa1208d27f29ca340c92c66d1926f13f"
        let u = this.url+"/wp-admin/admin-ajax.php"
        let params = new URLSearchParams()
        params.append("action", action)
        let result = await this.post(u, params, "")

        return result.data
    }

    async get_episode_stream_list(href){
        href = Buffer.from(href, "base64").toString("ascii")
        let result = await this.get(href)
        result = new JSSoup(result)
        result = result.find("div", "mirrorstream")
        result = result.findAll("ul")

        let stream_list = {}

        await result.map(async (d, index) => {
            let quality = d.attrs.class
            let a = d.findAll("a")

            if(a.length === 0){
                stream_list[quality] = []
            }
            else{
                stream_list[quality] = []
                await a.map((d_, index) => {
                    let item = {
                        server: d_.text,
                        data_content: d_.attrs['data-content']
                    }
                    stream_list[quality].push(item)
                })
            }
        })
        return stream_list
    }

    async stream_dump(href, useragent){
        let a = ""
        let result = await this.get(href, useragent)
        result = new JSSoup(result)
        result = result.findAll("script")
        await result.map((i) => {
            if(/var playerInstance=jwplayer\(\'arsipin\'\)\;/.test(i.text)){
                a = i.text
            }
        })
        result = a.match(/{\'[a-zA-Z0-9\'\:\/\-\.\?\=\&\_\,\%]+\}/).toString()
        result = result.replace(/\'/g,"\"")
        result = JSON.parse(result)
        return result.file
    }

    async get_stream(data_content, useragent){
        let params = new URLSearchParams()
        let action = "2a3505c93b0035d3f455df82bf976b84"
        let u = this.url+"/wp-admin/admin-ajax.php"
        data_content = Buffer.from(data_content, "base64").toString("ascii")
        data_content = JSON.parse(data_content)
        let nonce = await this.get_nonce()
        params.append("id", data_content.id)
        params.append("i", data_content.i)
        params.append("q", data_content.q)
        params.append("nonce", nonce)
        params.append("action", action)

        let result = await this.post(u, params, useragent)
        result = Buffer.from(result.data, "base64").toString("ascii")
        result = new JSSoup(result)

        result = result.find("iframe").attrs.src

        try{
            result = await this.stream_dump(result, useragent)
        }
        catch{
            //pass
        }

        return result
    }

    async get_anime_info(href){
        href = Buffer.from(href, "base64").toString("ascii")
        let result = await this.get(href)
        result = new JSSoup(result)
        result = result.find("div", "fotoanime")
        let img = Buffer.from(result.find("img").attrs.src, "ascii").toString("base64")
        let info = result.find("div", "infozingle")
        info = info.findAll("p")
        let infos = {}
        await info.map((i) => {
            let j = i.text.trim().split(":")
            infos[j[0]] = j[1].trim()
        })

        let sinopc = result.find("div", "sinopc").text.trim()

        result = {
            img: img,
            info: infos,
            sinopsis: sinopc
        }
        return result
    }

    async eps_title(href){
        href = Buffer.from(href, "base64").toString("ascii")
        let result = await this.get(href)
        result = new JSSoup(result)
        result = result.find("h1", "posttl")

        result = {
            title: result.text
        }
        return result
    }


}

exports.Anime = {
    OD: OD
};