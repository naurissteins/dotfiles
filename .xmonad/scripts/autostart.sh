#!/bin/bash

function run {
  if ! pgrep $1 ;
  then
    $@&
  fi
}

# Cursor active at boot
xsetroot -cursor_name left_ptr &

# Starting utility applications at boot time
# run variety &
run nm-applet &
run pamac-tray &
run xfce4-power-manager &
run xfce4-panel &
run volumeicon &
run flameshot &
numlockx on &
blueberry-tray &
/usr/lib/polkit-gnome/polkit-gnome-authentication-agent-1 &
/usr/lib/xfce4/notifyd/xfce4-notifyd &

# Some ways to set your wallpaper besides variety or nitrogen
feh --randomize --bg-fill /home/ns/Pictures/Wallpapers/Girls/Asian/* /home/ns/Pictures/Wallpapers/Girls/Asian/* /home/ns/Pictures/Wallpapers/Girls/Asian/*

# Polybar
#(sleep 2; run $HOME/.config/polybar/launch.sh) &

# starting user applications at boot time
#run caffeine &
#run insync start &
#run ckb-next -b &
