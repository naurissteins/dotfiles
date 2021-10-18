-- Main
import XMonad
import System.IO
import System.Exit
import qualified XMonad.StackSet as W

-- Actions
import XMonad.Actions.GridSelect
import XMonad.Actions.CycleWS (Direction1D(..), moveTo, shiftTo, WSType(..), nextScreen, prevScreen)
import XMonad.Actions.SpawnOn
import XMonad.Actions.MouseResize
import XMonad.Actions.WithAll (sinkAll, killAll)
import XMonad.Actions.CopyWindow (kill1)

-- Data
import Data.Semigroup
import Data.Monoid
import Data.Maybe (fromJust)
import Data.Maybe (isJust)
import qualified Data.Map as M

-- Hooks
import XMonad.Hooks.DynamicProperty
import XMonad.Hooks.DynamicLog
import XMonad.Hooks.EwmhDesktops
import XMonad.Hooks.ManageDocks (avoidStruts, docksEventHook, manageDocks, ToggleStruts(..))
import XMonad.Hooks.SetWMName
import XMonad.Hooks.ManageHelpers (isFullscreen, doFullFloat, isDialog, doCenterFloat, doRectFloat)

-- Layouts
import XMonad.Layout.Accordion
import XMonad.Layout.GridVariants (Grid(Grid))
import XMonad.Layout.SimplestFloat
import XMonad.Layout.Spiral
import XMonad.Layout.ResizableTile
import XMonad.Layout.Tabbed
import XMonad.Layout.ThreeColumns

--Layouts modifers
import XMonad.Layout.LayoutModifier
import XMonad.Layout.LimitWindows (limitWindows, increaseLimit, decreaseLimit)
import XMonad.Layout.Magnifier
import XMonad.Layout.MultiToggle (mkToggle, single, EOT(EOT), (??))
import XMonad.Layout.MultiToggle.Instances (StdTransformers(NBFULL, MIRROR, NOBORDERS))
import XMonad.Layout.NoBorders
import XMonad.Layout.Renamed
import XMonad.Layout.Simplest
import XMonad.Layout.Spacing
import XMonad.Layout.SubLayouts
import XMonad.Layout.WindowNavigation
import XMonad.Layout.WindowArranger (windowArrange, WindowArrangerMsg(..))
import qualified XMonad.Layout.ToggleLayouts as T (toggleLayouts, ToggleLayout(Toggle))
import qualified XMonad.Layout.MultiToggle as MT (Toggle(..))


-- Utilities
import XMonad.Util.Dmenu
import XMonad.Util.EZConfig(additionalKeysP)
import XMonad.Util.NamedScratchpad
import XMonad.Util.Scratchpad
import XMonad.Util.Run (runProcessWithInput, safeSpawn, spawnPipe)
import XMonad.Util.SpawnOnce
import Graphics.X11.ExtraTypes.XF86


------------------------------------------------------------------------
-- Main strings
------------------------------------------------------------------------
myFont :: String
myFont = "xft:SauceCodePro Nerd Font Mono:regular:size=9:antialias=true:hinting=true"

myTerminal :: String
myTerminal = "alacritty"        -- Default terminal

myModMask :: KeyMask
myModMask = mod4Mask            -- Super Key (--mod4Mask= super key --mod1Mask= alt key --controlMask= ctrl key --shiftMask= shift key)

myBrowser :: String
myBrowser = "firefox"           -- Default browser

myBorderWidth :: Dimension
myBorderWidth   = 0             -- Window border

myNormColor :: String
myNormColor   = "#282c34"       -- Border colors for windows

myFocusColor :: String
myFocusColor  = "#73d0ff"       -- Border colors of focused windows

------------------------------------------------------------------------
-- Space between Tiling Windows
------------------------------------------------------------------------
mySpacing :: Integer -> l a -> XMonad.Layout.LayoutModifier.ModifiedLayout Spacing l a
mySpacing i = spacingRaw False (Border 40 10 10 10) True (Border 10 10 10 10) True


------------------------------------------------------------------------
-- Tiling Windows
------------------------------------------------------------------------
tall     = renamed [Replace " <fc=#95e6cb><fn=2> \61449 </fn>Tall</fc>"]
           $ smartBorders
           $ windowNavigation
           $ addTabs shrinkText myTabTheme
           $ subLayout [] (smartBorders Simplest)
           $ limitWindows 8
           $ mySpacing 5
           $ ResizableTall 1 (3/100) (1/2) []
grid     = renamed [Replace " <fc=#95e6cb><fn=2> \61449 </fn>Grid</fc>"]
           $ smartBorders
           $ windowNavigation
           $ addTabs shrinkText myTabTheme
           $ subLayout [] (smartBorders Simplest)
           $ limitWindows 12
           $ mySpacing 5
           $ mkToggle (single MIRROR)
           $ Grid (16/10)   
mirror     = renamed [Replace " <fc=#95e6cb><fn=2> \61449 </fn>Mirror</fc>"]
           $ smartBorders
           $ windowNavigation
           $ addTabs shrinkText myTabTheme
           $ subLayout [] (smartBorders Simplest)
           $ limitWindows 6
           $ mySpacing 5
           $ Mirror  
           $ ResizableTall 1 (3/100) (1/2) []            
full     = renamed [Replace " <fc=#95e6cb><fn=2> \61449 </fn>Full</fc>"]
           $ Full              


------------------------------------------------------------------------
-- Layout Hook
------------------------------------------------------------------------
myLayoutHook = avoidStruts $ mouseResize $ windowArrange
               $ mkToggle (NBFULL ?? NOBORDERS ?? EOT) myDefaultLayout
             where
               myDefaultLayout =      withBorder myBorderWidth tall
                                  ||| grid
                                  ||| full
                                  ||| mirror


------------------------------------------------------------------------
-- Colors for tabs
------------------------------------------------------------------------
myTabTheme = def { fontName          = myFont
               , activeColor         = "#73d0ff"
               , inactiveColor       = "#191e2a"
               , activeBorderColor   = "#73d0ff"
               , inactiveBorderColor = "#191e2a"
               , activeTextColor     = "#191e2a"
               , inactiveTextColor   = "#c7c7c7"
               }


------------------------------------------------------------------------
-- Workspaces
------------------------------------------------------------------------
xmobarEscape :: String -> String
xmobarEscape = concatMap doubleLts
  where
    doubleLts 'a' = "<<"
    doubleLts x = [x]

myWorkspaces :: [String]
myWorkspaces = clickable . (map xmobarEscape)
    $ [" <fn=5>\61713</fn> ", " <fn=5>\61713</fn> ", " <fn=5>\61713</fn> ", " <fn=5>\61713</fn> ", " <fn=5>\61713</fn> "]
  where
    clickable l = ["<action=xdotool key super+" ++ show (i) ++ "> " ++ ws ++ "</action>" | (i, ws) <- zip [1 .. 5] l]

windowCount :: X (Maybe String)
windowCount = gets $ Just . show . length . W.integrate' . W.stack . W.workspace . W.current . windowset

------------------------------------------------------------------------
-- Scratch Pads
------------------------------------------------------------------------
myScratchPads :: [NamedScratchpad]
myScratchPads =
  [
      NS "discord"              "discord"              (appName =? "discord")                   (customFloating $ W.RationalRect 0.15 0.15 0.7 0.7)
    , NS "spotify"              "spotify"              (appName =? "spotify")                   (customFloating $ W.RationalRect 0.15 0.15 0.7 0.7)
    , NS "nautilus"             "nautilus"             (className =? "Org.gnome.Nautilus")      (customFloating $ W.RationalRect 0.15 0.15 0.7 0.7)
    , NS "ncmpcpp"              launchMocp             (title =? "ncmpcpp")                     (customFloating $ W.RationalRect 0.15 0.15 0.7 0.7)
    , NS "whatsapp-for-linux"   "whatsapp-for-linux"   (appName =? "whatsapp-for-linux")        (customFloating $ W.RationalRect 0.15 0.15 0.7 0.7)
    , NS "terminal"             launchTerminal         (title =? "scratchpad")                  (customFloating $ W.RationalRect 0.15 0.15 0.7 0.7)
  ]
  where
    launchMocp     = myTerminal ++ " -t ncmpcpp -e ncmpcpp"
    launchTerminal = myTerminal ++ " -t scratchpad"

------------------------------------------------------------------------
-- Custom Keys
------------------------------------------------------------------------
myKeys :: [(String, X ())]
myKeys =

    [
    -- Xmonad
        -- ("M-<KP_Subtract>", spawn "xmonad --recompile")                          -- Recompiles xmonad
        ("M-<KP_Multiply>", spawn "xmonad --recompile && xmonad --restart")         -- Recompile & Restarts xmonad
      , ("M-S-<KP_Divide>", io exitSuccess)                                         -- Quits xmonad

    -- System Volume (PulseAudio)
      , ("M-<F12>", spawn "pactl set-sink-volume @DEFAULT_SINK@ +10%")              -- Volume Up
      , ("M-<F11>", spawn "pactl set-sink-volume @DEFAULT_SINK@ -10%")              -- Volume Down
      , ("M-<F10>", spawn "pactl set-sink-mute @DEFAULT_SINK@ toggle")              -- Mute

    -- Screen
      , ("M-<XF86Eject>", spawn "arcolinux-logout")                                 -- Lock Screen

    -- Run Prompt
      , ("M-p", spawn "dmenu_run -i -nb '#212733' -nf '#a37acc' -sb '#55b4d4' -sf '#212733' -fn 'NotoMonoRegular:bold:pixelsize=15' -h 30") -- Run Dmenu (rofi -show drun)
      , ("M-s", spawn "sh $HOME/.config/rofi/launchers/misc/launcher.sh")           -- Rofi Launcher

    -- Apps
      , ("M-f", spawn "firefox")                                                    -- Firefox
      , ("M-b", spawn "brave")                                                      -- Brave
      , ("M-S-f", spawn "firefox -private-window")                                  -- Firefox Private mode
      , ("M-S-b", spawn "brave --incognito")                                        -- Brave Private mode
      , ("M-<XF86Tools>", spawn "flameshot gui")                                        -- Flameshot (screenshot)
      , ("M-S-<XF86Tools>", spawn "sleep 5 && flameshot full -p $HOME/Pictures/Screenshots") -- Flameshot (5 sec delay)
      , ("M-<Return>", spawn (myTerminal))                                          -- Terminal

    -- Windows navigation
      , ("M-<Space>", sendMessage NextLayout)                                       -- Rotate through the available layout algorithms
      , ("M1-a", sendMessage (MT.Toggle NBFULL) >> sendMessage ToggleStruts)        -- Toggles full width
      , ("M1-S-p>", withFocused $ windows . W.sink)                                 -- Push window back into tiling
      , ("M1-s", sinkAll)                                                           -- Push all windows back into tiling
      , ("M-<Left>", windows W.swapMaster)                                          -- Swap the focused window and the master window
      , ("M-<Up>", windows W.swapUp)                                                -- Swap the focused window with the previous window
      , ("M-<Down>", windows W.swapDown)                                            -- Swap the focused window with the next window

    -- Workspaces
      , ("M-.", nextScreen)                                                         -- Switch focus to next monitor
      , ("M-,", prevScreen)                                                         -- Switch focus to prev monitor
      , ("M-S-.", shiftTo Next nonNSP >> moveTo Next nonNSP)                        -- Shifts focused window to next ws
      , ("M-S-,", shiftTo Prev nonNSP >> moveTo Prev nonNSP)                        -- Shifts focused window to prev ws

    -- Kill windows
      , ("M-q", kill1)                                                              -- Quit the currently focused client
      , ("M-S-w", killAll)                                                          -- Quit all windows on current workspace
      , ("M-<Escape>", spawn "xkill")                                               -- Kill the currently focused client

    -- Increase/decrease spacing (gaps)
      , ("M-C-j", decWindowSpacing 4)                                               -- Decrease window spacing
      , ("M-C-k", incWindowSpacing 4)                                               -- Increase window spacing
      , ("M-C-h", decScreenSpacing 4)                                               -- Decrease screen spacing
      , ("M-C-l", incScreenSpacing 4)                                               -- Increase screen spacing

    -- Window resizing
      , ("M1-<Up>", sendMessage Shrink)                                           -- Shrink horiz window width
      , ("M1-<Down>", sendMessage Expand)                                          -- Expand horiz window width
      , ("M1-<Right>", sendMessage MirrorShrink)                                     -- Shrink vert window width
      , ("M1-<Left>", sendMessage MirrorExpand)                                       -- Expand vert window width

    -- Brightness Display 1
      , ("M-<F1>", spawn "sh $HOME/.xmonad/scripts/brightness.sh + DisplayPort-0")  -- Night Mode
      , ("M-<F2>", spawn "sh $HOME/.xmonad/scripts/brightness.sh - DisplayPort-0")  -- Day mode
      , ("M-S-<F1>", spawn "sh $HOME/.xmonad/scripts/brightness.sh = DisplayPort-0")-- Reset redshift light

    -- Brightness Display 2
      , ("M1-<F1>", spawn "sh $HOME/.xmonad/scripts/brightness.sh + HDMI-A-1")      -- Night Mode
      , ("M1-<F2>", spawn "sh $HOME/.xmonad/scripts/brightness.sh - HDMI-A-1")      -- Day mode
      , ("M1-S-<F1>", spawn "sh $HOME/.xmonad/scripts/brightness.sh = HDMI-A-1")    -- Reset redshift light

    -- Redshift
      , ("C-<F1>", spawn "redshift -O 5000K")                                       -- Day Mode
      , ("C-<F2>", spawn "redshift -O 3000K")                                       -- Night mode
      , ("C-S-<F1>", spawn "redshift -x")                                           -- Reset redshift light      

    -- Controls for MPD + ncmpcpp
      , ("M-<F8>", spawn "mpc play")                                                -- Play
      , ("M-S-<F8>", spawn "mpc toggle")                                            -- Pause/unpause
      , ("M-<F9>", spawn "mpc next")                                                -- Next
      , ("M-<F7>", spawn "mpc prev")                                                -- Prev
      , ("C-<F8>", spawn "mpc stop")                                                -- Stop

    -- Scratchpad windows
      , ("M-m", namedScratchpadAction myScratchPads "ncmpcpp")                      -- Ncmpcpp Player
      , ("M-o", namedScratchpadAction myScratchPads "spotify")                      -- Spotify
      , ("M-a", namedScratchpadAction myScratchPads "nautilus")                     -- Nautilus
      , ("M-d", namedScratchpadAction myScratchPads "discord")                      -- Discord
      , ("M-w", namedScratchpadAction myScratchPads "whatsapp-for-linux")           -- WhatsApp
      , ("M-t", namedScratchpadAction myScratchPads "terminal")                     -- Terminal

    -- ProtonVPN
      , ("M-S-c", spawn "protonvpn-cli c -f")                                       -- Connect
      , ("M-S-d", spawn "protonvpn-cli d")                                          -- Disconnect

    ]  

------------------------------------------------------------------------
-- Moving between WS
------------------------------------------------------------------------
      where nonNSP          = WSIs (return (\ws -> W.tag ws /= "NSP"))
            nonEmptyNonNSP  = WSIs (return (\ws -> isJust (W.stack ws) && W.tag ws /= "NSP"))

------------------------------------------------------------------------
-- Floats
------------------------------------------------------------------------
myManageHook :: XMonad.Query (Data.Monoid.Endo WindowSet)
myManageHook = composeAll
     [ className =? "confirm"                           --> doFloat
     , className =? "file_progress"                     --> doFloat
     , resource  =? "desktop_window"                    --> doIgnore
     , className =? "MEGAsync"                          --> doCenterFloat
     , className =? "dialog"                            --> doFloat
     , className =? "Downloads"                         --> doFloat
     , className =? "Save As..."                        --> doFloat
     , className =? "Org.gnome.NautilusPreviewer"       --> doRectFloat (W.RationalRect 0.15 0.15 0.7 0.7)
     , className =? "Sublime_merge"                     --> doRectFloat (W.RationalRect 0.15 0.15 0.7 0.7)
     , isFullscreen -->  doFullFloat
     , isDialog --> doCenterFloat
     ] <+> namedScratchpadManageHook myScratchPads

myHandleEventHook :: Event -> X All
myHandleEventHook = dynamicPropertyChange "WM_NAME" (title =? "Spotify" --> floating)
        where floating = doRectFloat (W.RationalRect 0.15 0.15 0.7 0.7)

------------------------------------------------------------------------
-- Startup Hooks
------------------------------------------------------------------------
myStartupHook = do
    spawnOnce "$HOME/.xmonad/scripts/autostart.sh"
    spawnOnce "xfce4-screensaver-preferences &"
    spawnOnce "sleep 1 && wmctrl -c 'Screensaver Preferences' &"
    spawnOnce "picom --experimental-backend &"
    spawnOnce "mpd &"
    spawnOnce "echo 0 | sudo tee -a /sys/module/hid_apple/parameters/fnmode &"
    spawnOnce "sleep 5 && conky -c $HOME/.config/conky/conky.conkyrc &"
    spawnOnce "xrandr --output DisplayPort-0 --primary --mode 2560x1440 --rate 144.00 --output HDMI-A-1 --mode 1920x1080 --rate 75.00 --right-of DisplayPort-0 &"
    setWMName "LG3D"


------------------------------------------------------------------------
-- Main Do
------------------------------------------------------------------------
main :: IO ()
main = do
        xmproc <- spawnPipe "/usr/bin/xmobar ~/.xmobarrc"
        xmonad $ ewmh def
                { manageHook = myManageHook <+> manageDocks
                , logHook = dynamicLogWithPP $ namedScratchpadFilterOutWorkspacePP $ xmobarPP
                        { ppOutput = hPutStrLn xmproc
                        , ppCurrent = xmobarColor "#ff79c6" "" . \s -> " <fn=2>\61713</fn>"
                         , ppVisible = xmobarColor "#d4bfff" ""
                         , ppHidden = xmobarColor "#d4bfff" ""
                         , ppHiddenNoWindows = xmobarColor "#d4bfff" ""
                         , ppTitle = xmobarColor "#c7c7c7" "" . shorten 60
                         , ppSep =  "<fc=#212733>  <fn=1> </fn> </fc>"
                         , ppOrder  = \(ws:l:_:_)  -> [ws,l]
                        }
                , modMask            = mod4Mask
                , layoutHook         = myLayoutHook
                , workspaces         = myWorkspaces
                , normalBorderColor  = myNormColor
                , focusedBorderColor = myFocusColor
                , terminal           = myTerminal
                , borderWidth        = myBorderWidth
                , startupHook        = myStartupHook
                , handleEventHook    = myHandleEventHook
                } `additionalKeysP` myKeys

-- Find app class name
-- xprop | grep WM_CLASS
-- https://xmobar.org/#diskio-disks-args-refreshrate
