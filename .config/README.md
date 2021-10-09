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

### Gthumb image viewer
```
yay -S gthumb gthumb-openexr-extension
```

### XFCE Screen Saver
```
sudo pacman -S xfce4-screensaver
```
To kill a specific window you can list them with `wmctrl -l` and then close it with `wmctrl -c 'App Name'`

### WMW Keys
```
ZF3R0-FHED2-M80TY-8QYGC-NPKYF
YF390-0HF8P-M81RQ-2DXQE-M2UT6
ZF71R-DMX85-08DQY-8YMNC-PPHV8
```

### Arandr GUI
```
pacman -S arandr
```

### Add Windows boot manager to GRUB
```
os-prober
grub-mkconfig -o /boot/grub/grub.cfg
```

### PhotoGIMP (photoshop mod)
Install GIMP Flatpak through your AppCenter/Package Manager or terminal:
```
flatpak install flathub org.gimp.GIMP
```
https://github.com/Diolinux/PhotoGIMP/issues/32#issuecomment-703177508

https://github.com/Diolinux/PhotoGIMP


### Disable FN function
```
sudo vim /sys/module/hid_apple/parameters/fnmode
change 1 to 0
```

0 = Fn key disabled
1 = Fn key pressed by default
2 = Fn key released by default
