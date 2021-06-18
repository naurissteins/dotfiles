-- Base
import XMonad
import System.IO
import System.Exit
import qualified XMonad.StackSet as W

import Graphics.X11.ExtraTypes.XF86

-- Actions
import XMonad.Actions.GridSelect
import XMonad.Actions.SpawnOn
import XMonad.Actions.MouseResize
import XMonad.Actions.WithAll (sinkAll, killAll)
import XMonad.Actions.CopyWindow (kill1)

-- Data
import Data.Monoid
import Data.Maybe (fromJust)
import qualified Data.Map as M

-- Hooks
import XMonad.Hooks.DynamicLog
import XMonad.Hooks.EwmhDesktops  -- for some fullscreen events, also for xcomposite in obs.
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

myFont :: String
myFont = "xft:SauceCodePro Nerd Font Mono:regular:size=9:antialias=true:hinting=true"

myTerminal :: String
myTerminal = "alacritty"        -- Sets default terminal

myModMask :: KeyMask
myModMask = mod4Mask            -- Sets modkey to super/windows key

myBrowser :: String
myBrowser = "firefox"           -- Sets qutebrowser as browser

myBorderWidth :: Dimension
myBorderWidth   = 5            -- Sets border width for windows

myNormColor :: String
myNormColor   = "#282c34"       -- Border color of normal windows

myFocusColor :: String
myFocusColor  = "#46d9ff"       -- Border color of focused windows


--Makes setting the spacingRaw simpler to write. The spacingRaw module adds a configurable amount of space around windows.
mySpacing :: Integer -> l a -> XMonad.Layout.LayoutModifier.ModifiedLayout Spacing l a
mySpacing i = spacingRaw False (Border 40 10 10 10) True (Border i i i i) True

-- Below is a variation of the above except no borders are applied
-- if fewer than two windows. So a single window has no gaps.
mySpacing' :: Integer -> l a -> XMonad.Layout.LayoutModifier.ModifiedLayout Spacing l a
mySpacing' i = spacingRaw True (Border i i i i) True (Border i i i i) True


-- Defining a bunch of layouts, many that I don't use.
-- limitWindows n sets maximum number of windows displayed for layout.
-- mySpacing n sets the gap size around the windows.
grid     = renamed [Replace "grid"]
           $ smartBorders
           $ addTabs shrinkText myTabTheme
           $ subLayout [] (smartBorders Simplest)
           $ limitWindows 12
           $ mySpacing 5
           $ mkToggle (single MIRROR)
           $ Grid (16/10)
tall     = renamed [Replace "tall"]
           $ smartBorders
           $ addTabs shrinkText myTabTheme
           $ subLayout [] (smartBorders Simplest)
           $ limitWindows 8
           $ mySpacing 5
           $ ResizableTall 1 (3/100) (1/2) []
magnify  = renamed [Replace "magnify"]
           $ smartBorders
           $ addTabs shrinkText myTabTheme
           $ subLayout [] (smartBorders Simplest)
           $ magnifier
           $ limitWindows 12
           $ mySpacing 5
           $ ResizableTall 1 (3/100) (1/2) []
monocle  = renamed [Replace "monocle"]
           $ smartBorders
           $ addTabs shrinkText myTabTheme
           $ subLayout [] (smartBorders Simplest)
           $ limitWindows 20 Full
floats   = renamed [Replace "floats"]
           $ smartBorders
           $ limitWindows 20 simplestFloat
spirals  = renamed [Replace "spirals"]
           $ smartBorders
           $ addTabs shrinkText myTabTheme
           $ subLayout [] (smartBorders Simplest)
           $ mySpacing' 5
           $ spiral (6/7)
threeCol = renamed [Replace "threeCol"]
           $ smartBorders
           $ addTabs shrinkText myTabTheme
           $ subLayout [] (smartBorders Simplest)
           $ limitWindows 7
           $ ThreeCol 1 (3/100) (1/2)
threeRow = renamed [Replace "threeRow"]
           $ smartBorders
           $ addTabs shrinkText myTabTheme
           $ subLayout [] (smartBorders Simplest)
           $ limitWindows 7
           -- Mirror takes a layout and rotates it by 90 degrees.
           -- So we are applying Mirror to the ThreeCol layout.
           $ Mirror
           $ ThreeCol 1 (3/100) (1/2)
tabs     = renamed [Replace "tabs"]
           -- I cannot add spacing to this layout because it will
           -- add spacing between window and tabs which looks bad.
           $ tabbed shrinkText myTabTheme
tallAccordion  = renamed [Replace "tallAccordion"]
           $ Accordion
wideAccordion  = renamed [Replace "wideAccordion"]
           $ Mirror Accordion



-- setting colors for tabs layout and tabs sublayout.
myTabTheme = def { fontName            = myFont
                , activeColor         = "#46d9ff"
                , inactiveColor       = "#313846"
                , activeBorderColor   = "#46d9ff"
                , inactiveBorderColor = "#282c34"
                , activeTextColor     = "#282c34"
                , inactiveTextColor   = "#d0d0d0"
                }

myLayoutHook = avoidStruts $ mouseResize $ windowArrange $ T.toggleLayouts floats
               $ mkToggle (NBFULL ?? NOBORDERS ?? EOT) myDefaultLayout
             where
               myDefaultLayout =      grid
                                  ||| magnify
                                  ||| noBorders monocle
                                  ||| floats
                                  ||| noBorders tabs
                                  ||| withBorder myBorderWidth tall
                                  ||| spirals
                                  ||| threeCol
                                  ||| threeRow
                                  ||| tallAccordion
                                  ||| wideAccordion


--
myWorkspaces    = [" dev "," www "," sys "," doc "," vbox "," chat "," mus "," vid "," gfx "]
myWorkspaceIndices = M.fromList $ zipWith (,) myWorkspaces [1..] -- (,) == \x y -> (x,y)

clickable ws = "<action=xdotool key super+"++show i++">"++ws++"</action>"
    where i = fromJust $ M.lookup ws myWorkspaceIndices


--Scratch Pads
myScratchPads :: [NamedScratchpad]
myScratchPads =
  [
      NS "discord"             "discord"              (appName =? "discord")                   (customFloating $ W.RationalRect 0.15 0.15 0.7 0.7)
    , NS "nautilus"            "nautilus"             (className =? "Org.gnome.Nautilus")      (customFloating $ W.RationalRect 0.15 0.15 0.7 0.7)
    , NS "mocp"                launchMocp             (title =? "mocp")                        (customFloating $ W.RationalRect 0.15 0.15 0.7 0.7)
    , NS "whatsapp-for-linux"  "whatsapp-for-linux"   (appName =? "whatsapp-for-linux")        (customFloating $ W.RationalRect 0.15 0.15 0.7 0.7)
    , NS "signal"              "signal"               (appName =? "signal")                    (customFloating $ W.RationalRect 0.15 0.15 0.7 0.7)
    , NS "terminal"            launchTerminal         (title =? "scratchpad")                  (customFloating $ W.RationalRect 0.15 0.15 0.7 0.7)
  ]
  where
    launchMocp     = myTerminal ++ " -t mocp -e mocp"
    launchTerminal = myTerminal ++ " -t scratchpad"

------------------------------------------------------------------------
-- My Custom Keys
--
myCustomKeys =

    [
    -- Xmonad
        ("M-<KP_Subtract>", spawn "xmonad --recompile")           -- Recompiles xmonad
      , ("M-<KP_Multiply>", spawn "xmonad --restart")             -- Restarts xmonad
      , ("M-S-<KP_Divide>", io exitSuccess)                                 -- Quits xmonad

    -- System Volume (PulseAudio)
      , ("M-<Page_Up>", spawn "pactl set-sink-volume @DEFAULT_SINK@ +10%")    -- Volume Up
      , ("M-<Page_Down>", spawn "pactl set-sink-volume @DEFAULT_SINK@ -10%")  -- Volume Down


    -- Run Prompt
      , ("M-p", spawn "dmenu_run")                      -- Run Dmenu
      , ("M-s", spawn "rofi -show drun")                -- Run Rofi

    -- Apps
      , ("M-S-a", spawn "atom")                         -- Atom Editor
      , ("M-S-f", spawn "firefox")                      -- Firefox
      , ("M-S-n", spawn "nautilus")
      , ("M-S-d", spawn "discord")
      , ("M-S-g", spawn "signal")
      , ("M-<Print>", spawn "flameshot gui")            -- Flameshot (screenshot)
      , ("M-<Return>", spawn (myTerminal))              -- Terminal


    -- Windows navigation
    --  , ("M-S-m", windows W.swapMaster)                 -- Swap the focused window and the master window


    -- Increase/decrease spacing (gaps)
      , ("M-C-j", decWindowSpacing 4)                   -- Decrease window spacing
      , ("M-C-k", incWindowSpacing 4)                   -- Increase window spacing
      , ("M-C-h", decScreenSpacing 4)                   -- Decrease screen spacing
      , ("M-C-l", incScreenSpacing 4)                   -- Increase screen spacing


    -- Kill windows
      , ("M-q", kill1)                                  -- Kill the currently focused client
      , ("M-S-w", killAll)                              -- Kill all windows on current workspace


    -- Window resizing
      , ("M-h", sendMessage Shrink)                     -- Shrink horiz window width
      , ("M-l", sendMessage Expand)                     -- Expand horiz window width
      --, ("M-M1-j", sendMessage MirrorShrink)          -- Shrink vert window width
      --, ("M-M1-k", sendMessage MirrorExpand)          -- Expand vert window width


    -- Redshift
      , ("M-<F5>", spawn "redshift -O 3000K")           -- Night Mode
      , ("M-<F6>", spawn "redshift -O 5000K")           -- Day mode
      , ("M-<F7>", spawn "redshift -x")                 -- Reset redshift light
      , ("M-<F8>", spawn ("echo \"" ++ help ++ "\" | xmessage -file -"))                -- Reset redshift light
      , ("M-<F9>", spawn ("echo \"Hello World\" | dzen2 -p"))               -- Reset redshift light
      , ("M-<10>", spawn ("killall conky dzen2"))               -- Reset redshift light



    -- Controls for mocp music player (SUPER-u followed by a key)
      , ("M-<Insert>", spawn "mocp --server; mocp --play")
      , ("M-S-<Insert>", spawn "mocp --exit")
      , ("M-<Home>", spawn "mocp --next")
      , ("M-<End>", spawn "mocp --previous")
      , ("M-<Delete>", spawn "mocp --toggle-pause")

      -- Quick view
      , ("M-m", namedScratchpadAction myScratchPads "mocp")     -- Mocp Player
      , ("M-a", namedScratchpadAction myScratchPads "nautilus") -- Nautilus file manager
      , ("M-d", namedScratchpadAction myScratchPads "discord") -- Nautilus file manager
      , ("M-w", namedScratchpadAction myScratchPads "whatsapp-for-linux") -- Nautilus file manager
      , ("M-t", namedScratchpadAction myScratchPads "terminal")
      , ("M-g", namedScratchpadAction myScratchPads "signal")

    ]

------------------------------------------------------------------------
-- Key bindings. Add, modify or remove key bindings here.
--
myKeys conf@(XConfig {XMonad.modMask = modm}) = M.fromList $

    -- launch a terminal
    [ -- ((modm .|. shiftMask, xK_Return), spawn $ XMonad.terminal conf)

    -- volume keys
     ((0, xF86XK_AudioMute), spawn "pactl set-sink-mute @DEFAULT_SINK@ toggle")
    , ((0, xF86XK_AudioLowerVolume), spawn "pactl set-sink-volume @DEFAULT_SINK@ -10%")
    , ((0, xF86XK_AudioRaiseVolume), spawn "pactl set-sink-volume @DEFAULT_SINK@ +10%")

    -- launch gmrun
    , ((modm .|. shiftMask, xK_p     ), spawn "gmrun")

    , ((modm,               xK_asciitilde ), spawn "nautilus")

     -- Rotate through the available layout algorithms
    , ((modm,               xK_space ), sendMessage NextLayout)

    --  Reset the layouts on the current workspace to default
    , ((modm .|. shiftMask, xK_space ), setLayout $ XMonad.layoutHook conf)

    -- Resize viewed windows to the correct size
    , ((modm,               xK_n     ), refresh)

    -- Move focus to the next window
    , ((modm,               xK_Tab   ), windows W.focusDown)

    -- Move focus to the next window
    , ((modm,               xK_j     ), windows W.focusDown)

    -- Move focus to the previous window
    , ((modm,               xK_k     ), windows W.focusUp  )

    -- Move focus to the master window
    , ((modm,               xK_m     ), windows W.focusMaster  )

    -- Swap the focused window with the next window
    , ((modm .|. shiftMask, xK_j     ), windows W.swapDown  )

    -- Swap the focused window with the previous window
    , ((modm .|. shiftMask, xK_k     ), windows W.swapUp    )

    -- Shrink the master area
    , ((modm,               xK_h     ), sendMessage Shrink)

    -- Expand the master area
    , ((modm,               xK_l     ), sendMessage Expand)

    -- Push window back into tiling
    , ((modm .|. shiftMask,  xK_z     ), withFocused $ windows . W.sink)

    -- Increment the number of windows in the master area
    , ((modm              , xK_comma ), sendMessage (IncMasterN 1))

    -- Deincrement the number of windows in the master area
    , ((modm              , xK_period), sendMessage (IncMasterN (-1)))

    -- Toggle the status bar gap
    -- Use this binding with avoidStruts from Hooks.ManageDocks.
    -- See also the statusBar function from Hooks.DynamicLog.
    --
    -- , ((modm              , xK_b     ), sendMessage ToggleStruts)


    -- Run xmessage with a summary of the default keybindings (useful for beginners)
    --, ((modm .|. shiftMask, xK_slash ), spawn ("echo \"" ++ help ++ "\" | xmessage -file -"))
    ]
    ++

    --
    -- mod-[1..9], Switch to workspace N
    -- mod-shift-[1..9], Move client to workspace N
    --
    [((m .|. modm, k), windows $ f i)
        | (i, k) <- zip (XMonad.workspaces conf) [xK_1 .. xK_9]
        , (f, m) <- [(W.greedyView, 0), (W.shift, shiftMask)]]
    ++

    --
    -- mod-{w,e,r}, Switch to physical/Xinerama screens 1, 2, or 3
    -- mod-shift-{w,e,r}, Move client to screen 1, 2, or 3
    --
    [((m .|. modm, key), screenWorkspace sc >>= flip whenJust (windows . f))
        | (key, sc) <- zip [xK_w, xK_e, xK_r] [0..]
        , (f, m) <- [(W.view, 0), (W.shift, shiftMask)]]


------------------------------------------------------------------------
-- Mouse bindings: default actions bound to mouse events
--
myMouseBindings (XConfig {XMonad.modMask = modm}) = M.fromList $

    -- mod-button1, Set the window to floating mode and move by dragging
    [ ((modm, button1), (\w -> focus w >> mouseMoveWindow w
                                       >> windows W.shiftMaster))

    -- mod-button2, Raise the window to the top of the stack
    , ((modm, button2), (\w -> focus w >> windows W.shiftMaster))

    -- mod-button3, Set the window to floating mode and resize by dragging
    , ((modm, button3), (\w -> focus w >> mouseResizeWindow w
                                       >> windows W.shiftMaster))

    -- you may also bind events to the mouse scroll wheel (button4 and button5)
    ]
--
myManageHook :: XMonad.Query (Data.Monoid.Endo WindowSet)
myManageHook = composeAll
     -- 'doFloat' forces a window to float.  Useful for dialog boxes and such.
     -- using 'doShift ( myWorkspaces !! 7)' sends program to workspace 8!
     -- I'm doing it this way because otherwise I would have to write out the full
     -- name of my workspaces and the names would be very long if using clickable workspaces.
     [ className =? "confirm"         --> doFloat
     , className =? "file_progress"   --> doFloat
     , className =? "dialog"          --> doFloat
     , className =? "download"        --> doFloat
     , className =? "Electron9"       --> doRectFloat (W.RationalRect 0.35 0.35 0.3 0.3)
     --, className =? "Chromium"        --> doRectFloat (W.RationalRect 0.15 0.15 0.7 0.7)
     --, className =? "firefox"         --> doRectFloat (W.RationalRect 0.15 0.15 0.7 0.7)
     , className =? "error"           --> doFloat
     , className =? "Gimp"            --> doFloat
     , className =? "notification"    --> doFloat
     , className =? "pinentry-gtk-2"  --> doFloat
     , className =? "splash"          --> doFloat
     , className =? "toolbar"         --> doFloat
     , title =? "Oracle VM VirtualBox Manager"  --> doFloat
     -- , title =? "Mozilla Firefox"     --> doShift ( myWorkspaces !! 1 )
     , className =? "brave-browser"   --> doShift ( myWorkspaces !! 1 )
     , className =? "qutebrowser"     --> doShift ( myWorkspaces !! 1 )
     , className =? "mpv"             --> doShift ( myWorkspaces !! 7 )
     , className =? "Gimp"            --> doShift ( myWorkspaces !! 8 )
     , className =? "VirtualBox Manager" --> doShift  ( myWorkspaces !! 4 )
     --, (className =? "firefox" <&&> resource =? "Dialog") --> doFloat  -- Float Firefox Dialog
     --, (className =? "Chromium" <&&> resource =? "Dialog") --> doCenterFloat  -- Float Firefox Dialog
     , isFullscreen -->  doFullFloat
     ] <+> namedScratchpadManageHook myScratchPads

------------------------------------------------------------------------

windowCount :: X (Maybe String)
windowCount = gets $ Just . show . length . W.integrate' . W.stack . W.workspace . W.current . windowset


-- Startup hook
myStartupHook = do
    spawnOnce "nitrogen --restore &"
    spawnOnce "picom --experimental-backend &"
    spawnOnce "xrandr --output DisplayPort-0 --primary --mode 2560x1440 --rate 144.00 --output HDMI-A-1 --mode 1920x1080 --rate 75.00 --right-of DisplayPort-0 &"
    -- spawn "$HOME/.xmonad/scripts/autostart.sh &"
    setWMName "LG3D"

------------------------------------------------------------------------
main :: IO ()
main = do
        xmproc <- spawnPipe "/usr/bin/xmobar ~/.xmobarrc"
        xmonad $ ewmh def
                { manageHook = myManageHook <+> manageDocks
                , logHook = dynamicLogWithPP $ namedScratchpadFilterOutWorkspacePP $ xmobarPP
                        { ppOutput = hPutStrLn xmproc
                        , ppCurrent = xmobarColor "#98be65" "" . wrap "[" "]"
                        , ppVisible = xmobarColor "#98be65" "" . clickable
                        , ppHidden = xmobarColor "#82AAFF" "" . wrap "*" "" . clickable
                        , ppHiddenNoWindows = xmobarColor "#c792ea" ""  . clickable
                        , ppTitle = xmobarColor "#b3afc2" "" . shorten 60
                        , ppSep =  "<fc=#666666> <fn=1>|</fn> </fc>"
                        , ppUrgent = xmobarColor "#C45500" "" . wrap "!" "!"
                        , ppExtras  = [windowCount]
                        , ppOrder  = \(ws:l:t:ex) -> [ws,l]++ex++[t]
                        }
                , modMask = mod4Mask
                , layoutHook = myLayoutHook
                , workspaces = myWorkspaces
                , normalBorderColor = myNormColor
                , focusedBorderColor = myFocusColor
                , terminal = myTerminal
                , borderWidth        = myBorderWidth
                , keys               = myKeys
                , mouseBindings      = myMouseBindings
                , startupHook        = myStartupHook
                } `additionalKeysP` myCustomKeys

-- Find app class name
-- xprop | grep WM_CLASS

-- | Finally, a copy of the default bindings in simple textual tabular format.
help :: String
help = unlines ["The default modifier key is 'alt'. Default keybindings:",
    "",
    "-- launching and killing programs",
    "mod-Shift-Enter  Launch xterminal",
    "mod-p            Launch dmenu",
    "mod-Shift-p      Launch gmrun",
    "mod-Shift-c      Close/kill the focused window",
    "mod-Space        Rotate through the available layout algorithms",
    "mod-Shift-Space  Reset the layouts on the current workSpace to default",
    "mod-n            Resize/refresh viewed windows to the correct size",
    "",
    "-- move focus up or down the window stack",
    "mod-Tab        Move focus to the next window",
    "mod-Shift-Tab  Move focus to the previous window",
    "mod-j          Move focus to the next window",
    "mod-k          Move focus to the previous window",
    "mod-m          Move focus to the master window",
    "",
    "-- modifying the window order",
    "mod-Return   Swap the focused window and the master window",
    "mod-Shift-j  Swap the focused window with the next window",
    "mod-Shift-k  Swap the focused window with the previous window",
    "",
    "-- resizing the master/slave ratio",
    "mod-h  Shrink the master area",
    "mod-l  Expand the master area",
    "",
    "-- floating layer support",
    "mod-t  Push window back into tiling; unfloat and re-tile it",
    "",
    "-- increase or decrease number of windows in the master area",
    "mod-comma  (mod-,)   Increment the number of windows in the master area",
    "mod-period (mod-.)   Deincrement the number of windows in the master area",
    "",
    "-- quit, or restart",
    "mod-Shift-q  Quit xmonad",
    "mod-q        Restart xmonad",
    "mod-[1..9]   Switch to workSpace N",
    "",
    "-- Workspaces & screens",
    "mod-Shift-[1..9]   Move client to workspace N",
    "mod-{w,e,r}        Switch to physical/Xinerama screens 1, 2, or 3",
    "mod-Shift-{w,e,r}  Move client to screen 1, 2, or 3",
    "",
    "-- Mouse bindings: default actions bound to mouse events",
    "mod-button1  Set the window to floating mode and move by dragging",
    "mod-button2  Raise the window to the top of the stack",
    "mod-button3  Set the window to floating mode and resize by dragging"]
