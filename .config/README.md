### Toggle Sublime Text 4 menu Toggle show/hide

If you wish to add a hotkey you can edit your Default (Linux).sublime-keymap file:

    press CTRL+SHIFT+P
    typing key bindings user
    select Preferences: Key Bindings - User

This should open the Default (Linux).sublime-keymap file. Add this line:

`{"keys": ["ctrl+alt+m"], "command": "toggle_menu"}`

If your .sublime-keymap file was empty, you should wrap the above in JSON array brackets [ and ], like so:

`[
    {"keys": ["ctrl+alt+m"], "command": "toggle_menu"}
]`


### A quick previewer for Nautilus
```
sudo pacman -S sushi
```


### Audio Thumbnails for file managers
```
yay -S ffmpegthumbnailer-mp3
```
