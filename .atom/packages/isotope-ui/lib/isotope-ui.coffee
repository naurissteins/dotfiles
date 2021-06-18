module.exports =

  config:
    fontFamily:
      description: 'Use one of the fonts available in this package.
        View the README for descriptions of each.'
      type: 'string'
      default: 'System Default'
      enum: [
        'Cantarell',
        'Clear Sans',
        'Fira Sans',
        'Open Sans',
        'Oxygen',
        'Roboto',
        'Source Sans Pro',
        'Ubuntu',
        'System Default'
      ]
    fontWeight:
      description: 'Not all fonts come in all weights: Canterell and Oxygen
        only have regular, Ubuntu and Open Sans don\'t have thin.'
      type: 'string'
      default: 'Regular'
      enum: [
        'Extra light / Thin',
        'Light',
        'Regular'
      ]
    customBackgroundColor:
      description: 'Choose a custom background color.'
      type: 'boolean'
      default: false
    customBackgroundColorPicker:
      description: 'Choose your background color.'
      type: 'color'
      default: 'white'
    backgroundGradient:
      description: 'Apply a subtle gradient to the background.'
      type: 'boolean'
      default: false
    backgroundImage:
      description: 'Use an image as a background.'
      type: 'boolean'
      default: false
    backgroundImagePath:
      description: 'The path to an image from your computer or
       the internets (e.g. hubblesite.org or unsplash.com).'
      type: 'string'
      default: 'atom://isotope-ui/resources/images/raket.jpg'
    lowContrastTooltip:
      description: 'Make tooltips low contrast and not so colorful.'
      type: 'boolean'
      default: false
    matchEditorFont:
      description: 'Match the font family you set for the editor.'
      type: 'boolean'
      default: false
    minimalMode:
      description: 'Make the layout more minimal.'
      type: 'boolean'
      default: false
    tabSizing:
      description: 'In Even mode all tabs will be the same size. Great for quickly closing many tabs. In Minimum mode the tabs will only take as little space as needed and also show longer file names.'
      type: 'string'
      default: 'Even'
      enum: [
        'Even',
        'Minimum'
      ]


  activate: (state) ->
    # code in separate file so deferral keeps activation time down
    atom.themes.onDidChangeActiveThemes ->
      Config = require './config'
      Config.apply()
