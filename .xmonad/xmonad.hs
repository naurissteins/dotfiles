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
import Data.Monoid
import Data.Maybe (fromJust)
import Data.Maybe (isJust)
import qualified Data.Map as M

-- Hooks
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
-- import XMonad.Util.Scratchpad (scratchpadSpawnAction, scratchpadSpawnActionTerminal, scratchpadManageHook, scratchpadFilterOutWorkspace)
import XMonad.Util.Run (runProcessWithInput, safeSpawn, spawnPipe)
import XMonad.Util.SpawnOnce


------------------------------------------------------------------------
-- Main strings
------------------------------------------------------------------------
myFont :: String
myFont = "xft:SauceCodePro Nerd Font Mono:regular:size=9:antialias=true:hinting=true"

myTerminal :: String
myTerminal = "alacritty"        -- Default terminal

myModMask :: KeyMask
myModMask = mod4Mask            -- Super Key

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
spirals  = renamed [Replace " <fc=#95e6cb><fn=2> \61449 </fn>Spirals</fc>"]
           $ smartBorders
           $ windowNavigation
           $ addTabs shrinkText myTabTheme
           $ subLayout [] (smartBorders Simplest)
           $ mySpacing 5
           $ spiral (6/7)
grid     = renamed [Replace " <fc=#95e6cb><fn=2> \61449 </fn>Grid</fc>"]
           $ smartBorders
           $ windowNavigation
           $ addTabs shrinkText myTabTheme
           $ subLayout [] (smartBorders Simplest)
           $ limitWindows 12
           $ mySpacing 5
           $ mkToggle (single MIRROR)
           $ Grid (16/10)
tall     = renamed [Replace " <fc=#95e6cb><fn=2> \61449 </fn>Tall</fc>"]
           $ smartBorders
           $ windowNavigation
           $ addTabs shrinkText myTabTheme
           $ subLayout [] (smartBorders Simplest)
           $ limitWindows 8
           $ mySpacing 5
           $ ResizableTall 1 (3/100) (1/2) []
magnify  = renamed [Replace " <fc=#95e6cb><fn=2> \61449 </fn>Magnify</fc>"]
           $ smartBorders
           $ windowNavigation
           $ addTabs shrinkText myTabTheme
           $ subLayout [] (smartBorders Simplest)
           $ magnifier
           $ limitWindows 12
           $ mySpacing 5
           $ ResizableTall 1 (3/100) (1/2) []
monocle  = renamed [Replace " <fc=#95e6cb><fn=2> \61449 </fn>Monocle</fc>"]
           $ smartBorders
           $ windowNavigation
           $ addTabs shrinkText myTabTheme
           $ subLayout [] (smartBorders Simplest)
           $ limitWindows 20 Full
threeCol = renamed [Replace " <fc=#95e6cb><fn=2> \61449 </fn>Three Col</fc>"]
           $ smartBorders
           $ windowNavigation
           $ addTabs shrinkText myTabTheme
           $ subLayout [] (smartBorders Simplest)
           $ limitWindows 7
           $ ThreeCol 1 (3/100) (1/2)
threeRow = renamed [Replace " <fc=#95e6cb><fn=2> \61449 </fn>Three Row</fc>"]
           $ smartBorders
           $ windowNavigation
           $ addTabs shrinkText myTabTheme
           $ subLayout [] (smartBorders Simplest)
           $ limitWindows 7
           $ Mirror
           $ ThreeCol 1 (3/100) (1/2)
tabs     = renamed [Replace " <fc=#95e6cb><fn=2> \61449 </fn>Tabs</fc>"]
           $ tabbed shrinkText myTabTheme
tallAccordion  = renamed [Replace " <fc=#95e6cb><fn=2> \61449 </fn>Tall A</fc>"]
           $ Accordion
wideAccordion  = renamed [Replace " <fc=#95e6cb><fn=2> \61449 </fn>Wide A</fc>"]
           $ Mirror Accordion

------------------------------------------------------------------------
-- Colors for tabs (not using)
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
-- Layout Hook
------------------------------------------------------------------------
myLayoutHook = avoidStruts $ mouseResize $ windowArrange
               $ mkToggle (NBFULL ?? NOBORDERS ?? EOT) myDefaultLayout
             where
               myDefaultLayout =      withBorder myBorderWidth tall
                                  ||| noBorders monocle
                                  ||| grid
                                  ||| spirals
                                  ||| noBorders tabs
                                  ||| magnify
                                  ||| threeCol
                                  ||| threeRow
                                  ||| tallAccordion
                                  ||| wideAccordion

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
    , NS "nautilus"             "nautilus"             (className =? "Org.gnome.Nautilus")      (customFloating $ W.RationalRect 0.15 0.15 0.7 0.7)
    , NS "ncmpcpp"              launchMocp             (title =? "ncmpcpp")                     (customFloating $ W.RationalRect 0.15 0.15 0.7 0.7)
    , NS "whatsapp-for-linux"   "whatsapp-for-linux"   (appName =? "whatsapp-for-linux")        (customFloating $ W.RationalRect 0.15 0.15 0.7 0.7)
    , NS "signal"               "signal"               (appName =? "signal")                    (customFloating $ W.RationalRect 0.15 0.15 0.7 0.7)
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
        ("M-<KP_Subtract>", spawn "xmonad --recompile")                       -- Recompiles xmonad
      , ("M-<KP_Multiply>", spawn "xmonad --restart")                         -- Restarts xmonad
      , ("M-S-<KP_Divide>", io exitSuccess)                                   -- Quits xmonad

    -- System Volume (PulseAudio)
      , ("M-<Page_Up>", spawn "pactl set-sink-volume @DEFAULT_SINK@ +10%")    -- Volume Up
      , ("M-<Page_Down>", spawn "pactl set-sink-volume @DEFAULT_SINK@ -10%")  -- Volume Down


    -- Run Prompt
      , ("M-p", spawn "dmenu_run")                                            -- Run Dmenu
      , ("M-s", spawn "rofi -show drun")                                      -- Run Rofi

    -- Apps
      , ("M-o", spawn "atom")                                                 -- Atom Editor
      , ("M-f", spawn "firefox")                                              -- Firefox
      , ("M-S-f", spawn "firefox -private-window")                            -- Firefox Private mode
      , ("M-<Print>", spawn "flameshot gui")                                  -- Flameshot (screenshot)
      , ("M-<Return>", spawn (myTerminal))                                    -- Terminal


    -- Windows navigation
      , ("M-<Left>", windows W.swapMaster)                                    -- Swap the focused window and the master window
      , ("M-<Space>", sendMessage NextLayout)                                 -- Rotate through the available layout algorithms
      , ("M-S-r>", refresh)                                                   -- Resize viewed windows to the correct size
      , ("M-S-p>", withFocused $ windows . W.sink)                            -- Push window back into tiling (for some reason not working)
      , ("M-S-t", sinkAll)                                                    -- Push all windows back into tiling
      , ("M-<Up>", windows W.swapUp)                                          -- Swap the focused window with the previous window
      , ("M-<Down>", windows W.swapDown)                                      -- Swap the focused window with the next window

    -- Workspaces
      , ("M-.", nextScreen)                                                   -- Switch focus to next monitor
      , ("M-,", prevScreen)                                                   -- Switch focus to prev monitor
      , ("M-S-.", shiftTo Next nonNSP >> moveTo Next nonNSP)                  -- Shifts focused window to next ws
      , ("M-S-,", shiftTo Prev nonNSP >> moveTo Prev nonNSP)                  -- Shifts focused window to prev ws


    -- Kill windows
      , ("M-q", kill1)                                                        -- Kill the currently focused client
      , ("M-S-w", killAll)                                                    -- Kill all windows on current workspace

    -- Increase/decrease spacing (gaps)
      , ("M-C-j", decWindowSpacing 4)                                         -- Decrease window spacing
      , ("M-C-k", incWindowSpacing 4)                                         -- Increase window spacing
      , ("M-C-h", decScreenSpacing 4)                                         -- Decrease screen spacing
      , ("M-C-l", incScreenSpacing 4)                                         -- Increase screen spacing

    -- Window resizing
      , ("C-h", sendMessage Shrink)                                           -- Shrink horiz window width
      , ("C-l", sendMessage Expand)                                           -- Expand horiz window width
      , ("C-j", sendMessage MirrorShrink)                                     -- Shrink vert window width
      , ("C-k", sendMessage MirrorExpand)                                     -- Expand vert window width

    -- Redshift
      , ("M-<F5>", spawn "redshift -O 3000K")                                 -- Night Mode
      , ("M-<F6>", spawn "redshift -O 5000K")                                 -- Day mode
      , ("M-<F7>", spawn "redshift -x")                                       -- Reset redshift light

    -- Controls for MPD + ncmpcpp
      , ("M-<Insert>", spawn "mpc play")                                      -- Play
      , ("M-S-<Insert>", spawn "mpc stop")                                    -- Stop
      , ("M-<Home>", spawn "mpc next")                                        -- Next
      , ("M-<End>", spawn "mpc prev")                                         -- Prev
      , ("M-<Delete>", spawn "mpc toggle")                                    -- Pause/unpause

      -- Scratchpad windows
      , ("M-m", namedScratchpadAction myScratchPads "ncmpcpp")                -- Ncmpcpp Player
      , ("M-a", namedScratchpadAction myScratchPads "nautilus")               -- Nautilus
      , ("M-d", namedScratchpadAction myScratchPads "discord")                -- Discord
      , ("M-w", namedScratchpadAction myScratchPads "whatsapp-for-linux")     -- WhatsApp
      , ("M-t", namedScratchpadAction myScratchPads "terminal")               -- Terminal
      , ("M-g", namedScratchpadAction myScratchPads "signal")                 -- Signal

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
     , className =? "dialog"                            --> doFloat
     , className =? "download"                          --> doFloat
     , className =? "Electron9"                         --> doRectFloat (W.RationalRect 0.35 0.35 0.3 0.3)
     , className =? "Org.gnome.NautilusPreviewer"       --> (customFloating $ W.RationalRect 0.15 0.15 0.7 0.7)
     , className =? "error"                             --> doFloat
     , className =? "Gimp"                              --> doFloat
     , className =? "notification"                      --> doFloat
     , className =? "pinentry-gtk-2"                    --> doFloat
     , className =? "splash"                            --> doFloat
     , className =? "toolbar"                           --> doFloat
     --, (className =? "Chromium" <&&> resource =? "Dialog") --> doCenterFloat  -- Float Firefox Dialog
     , isFullscreen -->  doFullFloat
     ] <+> namedScratchpadManageHook myScratchPads


------------------------------------------------------------------------
-- Startup Hooks
------------------------------------------------------------------------
myStartupHook = do
    spawnOnce "nitrogen --restore &"
    spawnOnce "picom --experimental-backend &"
    spawnOnce "mpd &"
    spawnOnce "nordvpn c &"
    spawnOnce "betterlockscreen -w dim &"
    spawnOnce "sleep 20 && conky -c $HOME/.config/conky/conky.conkyrc &"
    spawnOnce "xrandr --output DisplayPort-0 --primary --mode 2560x1440 --rate 144.00 --output HDMI-A-1 --mode 1920x1080 --rate 75.00 --right-of DisplayPort-0 &"
    -- spawn "$HOME/.xmonad/scripts/autostart.sh &"
    setWMName "LG3D"


------------------------------------------------------------------------
-- Startup Hooks
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
                         --, ppExtras  = [windowCount]
                         --, ppOrder  = \(ws:l:t:ex) -> [ws,l]++ex++[t]
                         , ppOrder  = \(ws:l:_:_)  -> [ws,l]
                        }
                , modMask = mod4Mask
                , layoutHook = myLayoutHook
                , workspaces = myWorkspaces
                , normalBorderColor = myNormColor
                , focusedBorderColor = myFocusColor
                , terminal = myTerminal
                , borderWidth        = myBorderWidth
                , startupHook        = myStartupHook
                } `additionalKeysP` myKeys

-- Find app class name
-- xprop | grep WM_CLASS
-- https://xmobar.org/#diskio-disks-args-refreshrate
