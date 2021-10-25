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
echo 0 | sudo tee -a /sys/module/hid_apple/parameters/fnmode
```

/etc/modprobe.d/hid_apple.conf
options hid_apple fnmode=2

0 = Fn key disabled
1 = Fn key pressed by default
2 = Fn key released by default

### FSlint
```
yay -S pygtk fslint
```

### F keys XMonad
```
F13 keycode 191 = <XF86Tools>
F14 keycode 192 = <XF86Launch5>
F15 keycode 193 = <XF86Launch6>
F16 keycode 194 = <XF86Launch7>
F17 keycode 195 = <XF86Launch8>
F18 keycode 196 = <XF86Launch9>
```

### Feh
Run `env | grep -i display` and check the value of `DISPLAY`. It is probably `:0.0`, or `:0`.
```
* * * * * DISPLAY=:0 /usr/bin/feh --randomize --bg-fill /home/ns/* /home/ns/*
```

### Pacman
List Installed packages
```
pacman -Q | cut -f 1 -d " " > ~/dotfiles/pacman.txt
```

### virt-manager
If KVM ready
```
LC_ALL=C lscpu | grep Virtualization
```
Packages
```
yay -S qemu virt-manager ebtables
```
Enable and start libvirtd
```
sudo systemctl enable libvirtd
sudo systemctl start libvirtd
```
Add premissions
```
sudo usermod -G libvirt -a ns
```

Fix resolution with xrandr
```
gtf 1920 1080 75
```

Add to .xprofile
```
xrandr --newmode "1920x1080_75.00"  220.75  1920 2064 2264 2608  1080 1083 1088 1130 -hsync +vsync
xrandr --addmode Virtual-1 "1920x1080_75.00"
xrandr --output Virtual-1 --mode "1920x1080_75.00" --pos 0x0 --rotate normal
```

Info
```
use xrandr and arandr to know the possible resolutions, frequency and the names of your monitors

IF you know your native resolution and frequency
for example 1920x1080 @ 60 herz
type this in your terminal
gtf 1920 1080 60
This is the result
You will need to copy/paste it later.
1920x1080 @ 60.00 Hz (GTF) hsync: 67.08 kHz; pclk: 172.80 MHz
Modeline "1920x1080_60.00"  172.80  1920 2040 2248 2576  1080 1081 1084 1118  -HSync +Vsync
```