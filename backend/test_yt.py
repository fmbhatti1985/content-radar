import yt_dlp

ydl_opts = {
    'quiet': True,
    'extract_flat': True,
    'skip_download': True,
    'no_warnings': True,
    'ignoreerrors': True
}
with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    info = ydl.extract_info("ytsearch1:test", download=False)
    for entry in info.get('entries', []):
        for k, v in entry.items():
            print(f"{k}: {type(v)}")
