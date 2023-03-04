const {NNMX} = require("./NNMX")

class ControlNNMX{
    constructor(){
        this.Anime = new NNMX();
    }

    async search(q){
        let res = await this.Anime.search(q)
        let response = {}
        if(res.length != 0){
            response = {
                status : 200,
                data  : res
            }
            return response
        }
        else{
            response = {
                status : 404,
                message : q+" was not found"
            }

            return response
        }
    }
    async get_anime_info(href){
        let response = {}
        try{
            let res = await this.Anime.get_anime_info(href)
            if(!res){
                let response = {
                    status : 302,
                    message : "Its Movie"
                }
                return response
            }
            response = {
                status : 200,
                data  : res
            }
            return response
        }catch{
            response = {
                status : 400,
                message : "Invalid request"
            }
            return response
        }
    }

    async get_episode_list(href){
        let response = {}
        try{
            let res = await this.Anime.get_episode_list(href)
            if(!res){
                let response = {
                    status : 302,
                    message : "Its Movie"
                }
                return response
            }
            response = {
                status : 200,
                data  : res
            }
            return response
        }catch{
            response = {
                status : 400,
                message : "Invalid request"
            }
            return response
        }
    }
    async get_stream_list(href, useragent){
        try{
            let res = await this.Anime.get_episode_stream_list(href)
            
            let stream_list = []

            for(let i = 0; i < res.length; i++){
                let stream = await this.Anime.uservideo_extractor(res[i].data_content)
                stream_list.push({
                    quality: res[i].quality,
                    stream: stream
                })
            }
            let r = {
                status: 200,
                data: stream_list
            }

            return r
        }catch{
            let response = {
                status : 400,
                message : "Invalid request"
            }
            return response
        }
    }
}

exports.ControlNNMX = new ControlNNMX()