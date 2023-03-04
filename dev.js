const nnmx = require("./API/interface/NNMX")


let _nnmx = new nnmx.NNMX()

//_nnmx.search("Kanojo Okarishimasu", 0, false)
//_nnmx.get_episode_list("aHR0cHM6Ly9uYW5pbWV4MS5jb20vYW5pbWUva2Fub2pvLW9rYXJpc2hpbWFzdS0ybmQtc2Vhc29uLw==").then(console.log)
//_nnmx.get_anime_info("aHR0cHM6Ly9uYW5pbWV4MS5jb20vYW5pbWUva2Fub2pvLW9rYXJpc2hpbWFzdS0ybmQtc2Vhc29uLw==")
//_nnmx.get_episode_stream_list("aHR0cHM6Ly9uYW5pbWV4MS5jb20vZXBpc29kZS9rYW5vam8tb2thcmlzaGltYXN1LTJuZC1zZWFzb24tZXBpc29kZS0wMDEv")
_nnmx.uservideo_extractor("https://uservideo.xyz/file/nanime.kanokari.s2.e01.480p.mp4?embed=true&amp;autoplay=true", "")