# Copyright (C) 2016-present Arctic Ice Studio <development@arcticicestudio.com>
# Copyright (C) 2016-present Sven Greb <development@svengreb.de>

# Project:    Nord Atom UI
# Repository: https://github.com/arcticicestudio/nord-atom-ui
# License:    MIT

root = document.documentElement;

module.exports =
  activate: (state) ->
    atom.config.observe 'nord-atom-ui.tabSizing', (noFullWidth) ->
      setTabSizing(noFullWidth)
    atom.config.observe 'nord-atom-ui.darkerFormFocusEffect', (noSnowLight) ->
      setFormFocusEffect(noSnowLight)

  deactivate: ->
    unsetTabSizing()
    unsetFormFocusEffect()

setFormFocusEffect = (noSnowLight) ->
  if (noSnowLight)
    root.setAttribute('theme-nord-atom-ui-form-focus-effect', "nosnowlight")
  else
    unsetFormFocusEffect()

setTabSizing = (noFullWidth) ->
  if (noFullWidth)
    unsetTabSizing()
  else
    root.setAttribute('theme-nord-atom-ui-tabsizing', "nofullwidth")

unsetFormFocusEffect = ->
  root.removeAttribute('theme-nord-atom-ui-form-focus-effect')

unsetTabSizing = ->
  root.removeAttribute('theme-nord-atom-ui-tabsizing')
