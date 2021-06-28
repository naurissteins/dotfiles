(function() {
  var balanced, controlKeywords, floatPattern, guarded, otherKeywords, pragmas, prelude, ref;

  prelude = require('./prelude');

  pragmas = require('./pragmas');

  ref = require('./util'), balanced = ref.balanced, guarded = ref.guarded, floatPattern = ref.floatPattern, controlKeywords = ref.controlKeywords, otherKeywords = ref.otherKeywords;

  module.exports = {
    block_comment: {
      patterns: [
        {
          name: 'comment.block.haddock.haskell',
          begin: /\{-\s*[|^]/,
          end: /-\}/,
          applyEndPatternLast: 1,
          beginCaptures: {
            0: {
              name: 'punctuation.definition.comment.haddock.haskell'
            }
          },
          endCaptures: {
            0: {
              name: 'punctuation.definition.comment.haddock.haskell'
            }
          },
          patterns: [
            {
              include: '#block_comment'
            }
          ]
        }, {
          name: 'comment.block.haskell',
          begin: /\{-/,
          end: /-\}/,
          applyEndPatternLast: 1,
          beginCaptures: {
            0: {
              name: 'punctuation.definition.comment.block.start.haskell'
            }
          },
          endCaptures: {
            0: {
              name: 'punctuation.definition.comment.block.end.haskell'
            }
          },
          patterns: [
            {
              include: '#block_comment'
            }
          ]
        }
      ]
    },
    comments: {
      patterns: [
        {
          begin: /({maybeBirdTrack}[ \t]+)?(?=--+\s+[|^])/,
          end: /(?!\G)/,
          patterns: [
            {
              name: 'comment.line.double-dash.haddock.haskell',
              begin: /(--+)\s+([|^])/,
              end: /$/,
              beginCaptures: {
                1: {
                  name: 'punctuation.definition.comment.haskell'
                },
                2: {
                  name: 'punctuation.definition.comment.haddock.haskell'
                }
              }
            }
          ]
        }, {

          /*
          Operators may begin with -- as long as they are not
          entirely composed of - characters. This means comments can't be
          immediately followed by an allowable operator character.
           */
          begin: /({maybeBirdTrack}[ \t]+)?(?=--+(?!{operatorChar}))/,
          end: /(?!\G)/,
          patterns: [
            {
              name: 'comment.line.double-dash.haskell',
              begin: /--/,
              end: /$/,
              beginCaptures: {
                0: {
                  name: 'punctuation.definition.comment.haskell'
                }
              }
            }
          ]
        }, {
          include: '#block_comment'
        }
      ]
    },
    characters: {
      patterns: [
        {
          match: '{escapeChar}',
          name: 'constant.character.escape.haskell'
        }, {
          match: '{octalChar}',
          name: 'constant.character.escape.octal.haskell'
        }, {
          match: '{hexChar}',
          name: 'constant.character.escape.hexadecimal.haskell'
        }, {
          match: '{controlChar}',
          name: 'constant.character.escape.control.haskell'
        }
      ]
    },
    module_exports: {
      name: 'meta.declaration.exports.haskell',
      begin: /\(/,
      end: /\)/,
      applyEndPatternLast: 1,
      patterns: [
        {
          include: '#comments'
        }, {
          include: '#c_preprocessor'
        }, {
          begin: /{lb}(module){rb}/,
          end: /{lb}({className}){rb}/,
          beginCaptures: {
            1: {
              name: 'keyword.other.haskell'
            }
          },
          endCaptures: {
            1: {
              name: 'support.other.module.haskell'
            }
          },
          patterns: [
            {
              include: '#invalid'
            }
          ]
        }, {
          include: '#function_name'
        }, {
          include: '#type_name'
        }, {
          include: '#comma'
        }, {
          include: '#infix_op'
        }, {
          name: 'meta.other.constructor-list.haskell',
          begin: /\(/,
          end: /\)/,
          patterns: [
            {
              include: '#comments'
            }, {
              include: '#c_preprocessor'
            }, {
              include: '#type_ctor'
            }, {
              include: '#attribute_name'
            }, {
              include: '#comma'
            }, {
              match: /\.\./,
              name: 'keyword.operator.wildcard.haskell'
            }, {
              include: '#infix_op'
            }
          ]
        }
      ]
    },
    module_name: {
      name: 'support.other.module.haskell',
      match: /{lb}{className}{rb}/
    },
    module_name_prefix: {
      name: 'support.other.module.haskell',
      match: /{lb}{className}\./
    },
    pragma: {
      name: 'meta.preprocessor.haskell',
      begin: /\{-#/,
      end: /#-\}/,
      patterns: [
        {
          match: "{lb}((?i:" + (pragmas.join('|')) + ")){rb}",
          name: 'keyword.other.preprocessor.haskell'
        }
      ]
    },
    function_type_declaration: {
      name: 'meta.function.type-declaration.haskell',
      begin: /{indentBlockStart}{functionTypeDeclaration}/,
      end: '{indentBlockEnd}|(?={scoped_assignment})',
      contentName: 'meta.type-signature.haskell',
      beginCaptures: {
        2: {
          patterns: [
            {
              include: '#function_name'
            }, {
              include: '#infix_op'
            }
          ]
        },
        3: {
          name: 'keyword.other.double-colon.haskell'
        }
      },
      patterns: [
        {
          include: '#type_signature'
        }
      ]
    },
    multiline_type_declaration: {
      name: 'meta.multiline.type-declaration.haskell',
      begin: /{indentBlockStart}({doubleColonOperator})/,
      end: '{indentBlockCont}|(?={scoped_assignment})',
      contentName: 'meta.type-signature.haskell',
      beginCaptures: {
        2: {
          name: 'keyword.other.double-colon.haskell'
        }
      },
      patterns: [
        {
          include: '#type_signature'
        }
      ]
    },
    lazy_function_type_signature: {
      name: 'meta.function.type-declaration.haskell',
      begin: /{indentBlockStart}({functionList})\s*$/,
      end: /{indentBlockEnd}/,
      contentName: 'meta.type-signature.haskell',
      beginCaptures: {
        2: {
          patterns: [
            {
              include: '#function_name'
            }, {
              include: '#infix_op'
            }
          ]
        }
      },
      patterns: [
        {
          include: '#double_colon_operator'
        }, {
          include: '#type_signature'
        }
      ]
    },
    double_colon_operator: {
      name: 'keyword.other.double-colon.haskell',
      match: '{doubleColonOperator}'
    },
    ctor_type_declaration: {
      name: 'meta.ctor.type-declaration.haskell',
      begin: /{indentBlockStart}{ctorTypeDeclaration}/,
      end: /{indentBlockEnd}/,
      contentName: 'meta.type-signature.haskell',
      beginCaptures: {
        2: {
          patterns: [
            {
              include: '#type_ctor'
            }, {
              include: '#infix_op'
            }
          ]
        },
        3: {
          name: 'keyword.other.double-colon.haskell'
        }
      },
      patterns: [
        {
          include: '#type_signature'
        }
      ]
    },
    record_field_declaration: {
      name: 'meta.record-field.type-declaration.haskell',
      begin: /{lb}{functionTypeDeclaration}/,
      end: /(?={functionTypeDeclaration}|})/,
      contentName: 'meta.type-signature.haskell',
      beginCaptures: {
        1: {
          patterns: [
            {
              include: '#attribute_name'
            }, {
              include: '#infix_op'
            }
          ]
        },
        2: {
          name: 'keyword.other.double-colon.haskell'
        }
      },
      patterns: [
        {
          include: '#type_signature'
        }
      ]
    },
    type_signature: {
      patterns: [
        {
          include: '#pragma'
        }, {
          include: '#comments'
        }, {
          name: 'keyword.other.forall.haskell',
          match: '{lb}forall{rb}'
        }, {
          include: '#quoted_character'
        }, {
          match: /'(\(\))/,
          name: 'other.promoted.haskell',
          captures: {
            1: {
              patterns: [
                {
                  include: '#unit'
                }
              ]
            }
          }
        }, {
          include: '#unit'
        }, {
          match: /'(\[\])/,
          name: 'other.promoted.haskell',
          captures: {
            1: {
              patterns: [
                {
                  include: '#empty_list'
                }
              ]
            }
          }
        }, {
          include: '#empty_list'
        }, {
          include: '#string'
        }, {
          include: '#arrow'
        }, {
          include: '#big_arrow'
        }, {
          match: "'({operator})",
          name: 'other.promoted.haskell',
          captures: {
            1: {
              patterns: [
                {
                  include: '#operator'
                }
              ]
            }
          }
        }, {
          include: '#operator'
        }, {
          include: '#type_variable'
        }, {
          name: 'other.promoted.haskell',
          match: /{lbrel}'({className}){rb}/,
          captures: {
            1: {
              patterns: [
                {
                  include: '#type_name'
                }
              ]
            }
          }
        }, {
          include: '#type_name'
        }, {
          include: '#lit_num'
        }
      ]
    },
    arrow: {
      name: 'keyword.other.arrow.haskell',
      match: '{arrow}'
    },
    big_arrow: {
      name: 'keyword.other.big-arrow.haskell',
      match: '{big_arrow}'
    },
    type_variable: {
      name: 'variable.other.generic-type.haskell',
      match: /{lb}{functionName}{rb}/
    },
    unit: {
      name: 'constant.language.unit.haskell',
      match: /\(\)/
    },
    empty_list: {
      name: 'constant.language.empty-list.haskell',
      match: /\[\]/
    },
    deriving: {
      patterns: [
        {
          include: '#deriving_list'
        }, {
          include: '#deriving_simple'
        }, {
          include: '#deriving_keyword'
        }
      ]
    },
    deriving_strategies: {
      name: 'meta.deriving.strategy.haskell',
      match: '{lb}(stock|newtype|anyclass){rb}',
      captures: {
        1: {
          name: 'keyword.other.haskell'
        }
      }
    },
    deriving_keyword: {
      name: 'meta.deriving.haskell',
      match: /{lb}{deriving}{rb}/,
      captures: {
        1: {
          name: 'keyword.other.haskell'
        },
        2: {
          patterns: [
            {
              include: '#deriving_strategies'
            }
          ]
        }
      }
    },
    deriving_list: {
      name: 'meta.deriving.haskell',
      begin: /{lb}{deriving}\s*\(/,
      end: /\)/,
      beginCaptures: {
        1: {
          name: 'keyword.other.haskell'
        },
        2: {
          patterns: [
            {
              include: '#deriving_strategies'
            }
          ]
        }
      },
      patterns: [
        {
          match: /{lb}({className}){rb}/,
          captures: {
            1: {
              name: 'entity.other.inherited-class.haskell'
            }
          }
        }
      ]
    },
    deriving_simple: {
      name: 'meta.deriving.haskell',
      match: /{lb}{deriving}\s*({className}){rb}/,
      captures: {
        1: {
          name: 'keyword.other.haskell'
        },
        2: {
          patterns: [
            {
              include: '#deriving_strategies'
            }
          ]
        },
        3: {
          name: 'entity.other.inherited-class.haskell'
        }
      }
    },
    via: {
      patterns: [
        {
          include: '#via_list'
        }, {
          include: '#via_list_newline'
        }, {
          include: '#via_indent'
        }, {
          include: '#via_simple'
        }, {
          include: '#via_keyword'
        }
      ]
    },
    via_keyword: {
      name: 'meta.via.haskell',
      match: /{lb}(via){rb}/,
      captures: {
        1: {
          name: 'keyword.other.haskell'
        }
      }
    },
    via_simple: {
      name: 'meta.via.haskell',
      match: /{lb}(via)\s*({className}){rb}/,
      captures: {
        1: {
          name: 'keyword.other.haskell'
        },
        2: {
          patterns: [
            {
              include: "#type_signature"
            }
          ]
        }
      }
    },
    via_list: {
      name: 'meta.via.haskell',
      begin: /{lb}(via)\s*\(/,
      end: /\)/,
      beginCaptures: {
        1: {
          name: 'keyword.other.haskell'
        }
      },
      patterns: [
        {
          include: "#type_signature"
        }
      ]
    },
    via_list_newline: {
      name: 'meta.via.haskell',
      begin: /{lb}(via)\s*/,
      end: /$/,
      beginCaptures: {
        1: {
          name: 'keyword.other.haskell'
        }
      },
      patterns: [
        {
          include: "#type_signature"
        }
      ]
    },
    via_indent: {
      name: 'meta.via.haskell',
      begin: /{indentBlockStart}(via)\s*/,
      end: /{indentBlockCont}/,
      beginCaptures: {
        2: {
          name: 'keyword.other.haskell'
        }
      },
      patterns: [
        {
          include: "#type_signature"
        }
      ]
    },
    infix_function: {
      name: 'keyword.operator.function.infix.haskell',
      match: /(`){functionName}(`)/,
      captures: {
        1: {
          name: 'punctuation.definition.entity.haskell'
        },
        2: {
          name: 'punctuation.definition.entity.haskell'
        }
      }
    },
    quasi_quotes: {
      begin: /(\[)((?:{className}\.)?({functionNameOne}))(\|)/,
      end: /(\|)(\])/,
      beginCaptures: {
        1: {
          name: 'punctuation.definition.quasiquotes.begin.haskell'
        },
        2: {
          name: 'entity.name.tag.haskell',
          patterns: {
            include: '#module_name_prefix'
          }
        }
      },
      endCaptures: {
        2: {
          name: 'punctuation.definition.quasiquotes.end.haskell'
        }
      },
      contentName: 'quoted.quasiquotes.qq-$3.haskell'
    },
    module_decl: {
      name: 'meta.declaration.module.haskell',
      begin: /{indentBlockStart}(module){rb}/,
      end: /{lb}(where){rb}|{indentBlockEnd}/,
      beginCaptures: {
        2: {
          name: 'keyword.other.haskell'
        }
      },
      endCaptures: {
        1: {
          name: 'keyword.other.haskell'
        }
      },
      patterns: [
        {
          include: '#comments'
        }, {
          include: '#module_name'
        }, {
          include: '#module_exports'
        }, {
          include: '#invalid'
        }
      ]
    },
    hsig_decl: {
      name: 'meta.declaration.module.haskell',
      begin: /{indentBlockStart}(signature){rb}/,
      end: /{lb}(where){rb}|{indentBlockEnd}/,
      beginCaptures: {
        2: {
          name: 'keyword.other.haskell'
        }
      },
      endCaptures: {
        1: {
          name: 'keyword.other.haskell'
        }
      },
      patterns: [
        {
          include: '#comments'
        }, {
          include: '#module_name'
        }, {
          include: '#module_exports'
        }, {
          include: '#invalid'
        }
      ]
    },
    class_decl: {
      name: 'meta.declaration.class.haskell',
      begin: /{indentBlockStart}(class){rb}/,
      end: /{lb}(where){rb}|{indentBlockEnd}/,
      beginCaptures: {
        2: {
          name: 'keyword.other.class.haskell'
        }
      },
      endCaptures: {
        1: {
          name: 'keyword.other.haskell'
        }
      },
      patterns: [
        {
          include: '#type_signature'
        }
      ]
    },
    instance_decl: {
      name: 'meta.declaration.instance.haskell',
      begin: /{indentBlockStart}(instance){rb}/,
      end: /{lb}(where){rb}|{indentBlockEnd}/,
      contentName: 'meta.type-signature.haskell',
      beginCaptures: {
        2: {
          name: 'keyword.other.haskell'
        }
      },
      endCaptures: {
        1: {
          name: 'keyword.other.haskell'
        }
      },
      patterns: [
        {
          include: '#pragma'
        }, {
          include: '#type_signature'
        }
      ]
    },
    deriving_instance_decl: {
      name: 'meta.declaration.instance.deriving.haskell',
      begin: /{indentBlockStart}(?:{deriving}\s+|(deriving)\s+(via)\s+(.*)\s+)?(instance){rb}/,
      end: /{indentBlockEnd}/,
      contentName: 'meta.type-signature.haskell',
      beginCaptures: {
        2: {
          name: 'keyword.other.haskell'
        },
        3: {
          patterns: [
            {
              include: '#deriving_strategies'
            }
          ]
        },
        4: {
          name: 'keyword.other.haskell'
        },
        5: {
          name: 'keyword.other.haskell'
        },
        6: {
          name: 'meta.type-signature.haskell',
          patterns: [
            {
              include: '#type_signature'
            }
          ]
        },
        7: {
          name: 'keyword.other.haskell'
        }
      },
      patterns: [
        {
          include: '#pragma'
        }, {
          include: '#type_signature'
        }
      ]
    },
    foreign_import: {
      name: 'meta.foreign.haskell',
      begin: /{indentBlockStart}(foreign)\s+(import|export){rb}/,
      end: /{indentBlockEnd}/,
      beginCaptures: {
        2: {
          name: 'keyword.other.haskell'
        },
        3: {
          name: 'keyword.other.haskell'
        }
      },
      patterns: [
        {
          match: /(?:un)?safe/,
          captures: {
            0: {
              name: 'keyword.other.haskell'
            }
          }
        }, {
          include: '#function_type_declaration'
        }, {
          include: '#haskell_expr'
        }, {
          include: '#comments'
        }
      ]
    },
    regular_import: {
      name: 'meta.import.haskell',
      begin: /{indentBlockStart}(import){rb}/,
      end: /{indentBlockEnd}/,
      beginCaptures: {
        2: {
          name: 'keyword.other.haskell'
        }
      },
      patterns: [
        {
          include: '#module_name'
        }, {
          include: '#module_exports'
        }, {
          match: /{lb}(qualified|as|hiding){rb}/,
          captures: {
            1: {
              name: 'keyword.other.haskell'
            }
          }
        }, {
          include: '#comments'
        }
      ]
    },
    data_decl: {
      name: 'meta.declaration.type.data.haskell',
      begin: /{indentBlockStart}(data|newtype)\s+{data_def}/,
      end: /{indentBlockEnd}/,
      beginCaptures: {
        2: {
          name: 'keyword.other.data.haskell'
        },
        3: {
          name: 'meta.type-signature.haskell',
          patterns: [
            {
              include: '#family_and_instance'
            }, {
              include: '#type_signature'
            }
          ]
        }
      },
      patterns: [
        {
          include: '#comments'
        }, {
          include: '#string'
        }, {
          include: '#where'
        }, {
          include: '#deriving'
        }, {
          include: '#via'
        }, {
          include: '#assignment_op'
        }, {
          include: '#type_ctor_forall'
        }, {
          include: '#type_ctor_alt'
        }, {
          match: /\|/,
          captures: {
            0: {
              name: 'punctuation.separator.pipe.haskell'
            }
          }
        }, {
          name: 'meta.declaration.type.data.record.block.haskell',
          begin: /\{/,
          beginCaptures: {
            0: {
              name: 'keyword.operator.record.begin.haskell'
            }
          },
          end: /\}/,
          endCaptures: {
            0: {
              name: 'keyword.operator.record.end.haskell'
            }
          },
          patterns: [
            {
              include: '#comments'
            }, {
              include: '#comma'
            }, {
              include: '#record_field_declaration'
            }
          ]
        }, {
          include: '#ctor_type_declaration'
        }
      ]
    },
    type_ctor_forall: {
      begin: '{lb}forall{rb}',
      end: '{type_ctor_alt_delim}',
      contentName: 'meta.type-signature',
      beginCaptures: {
        0: {
          patterns: [
            {
              include: '#type_signature'
            }
          ]
        }
      },
      patterns: [
        {
          include: '#comments'
        }, {
          match: '\\G.*?{big_arrow}',
          captures: {
            0: {
              patterns: [
                {
                  include: '#type_signature'
                }
              ]
            }
          }
        }, {
          match: '\\G.*?\\.',
          captures: {
            0: {
              patterns: [
                {
                  include: '#type_signature'
                }
              ]
            }
          }
        }, {
          include: '#big_arrow'
        }, {
          include: '#type_variable'
        }, {
          begin: '\\(',
          end: '\\)',
          patterns: [
            {
              include: '#type_signature'
            }
          ]
        }, {
          include: '#type_ctor_alt'
        }
      ]
    },
    type_ctor_alt: {
      begin: '{lb}({className})\\s*',
      end: '{type_ctor_alt_delim}',
      contentName: 'meta.type-signature',
      beginCaptures: {
        1: {
          patterns: [
            {
              include: '#type_ctor'
            }
          ]
        }
      },
      patterns: [
        {
          include: '#comments'
        }, {
          include: '#type_signature'
        }
      ]
    },
    type_alias: {
      name: 'meta.declaration.type.type.haskell',
      begin: /{indentBlockStart}(type){rb}/,
      end: /{indentBlockEnd}/,
      contentName: 'meta.type-signature.haskell',
      beginCaptures: {
        2: {
          name: 'keyword.other.type.haskell'
        }
      },
      patterns: [
        {
          include: '#comments'
        }, {
          include: '#family_and_instance'
        }, {
          include: '#where'
        }, {
          include: '#assignment_op'
        }, {
          include: '#type_signature'
        }
      ]
    },
    keywords: [
      {
        name: 'keyword.other.$1.haskell',
        match: "{lb}(" + (otherKeywords.join('|')) + "){rb}"
      }, {
        name: 'keyword.operator.$1.haskell',
        match: /{lb}(infix[lr]?){rb}/
      }, {
        name: 'keyword.control.$1.haskell',
        match: "{lb}(" + (controlKeywords.join('|')) + "){rb}"
      }
    ],
    c_preprocessor: {
      name: 'meta.preprocessor.c',
      begin: /{maybeBirdTrack}(?=#)/,
      end: '(?<!\\\\)(?=$)',
      patterns: [
        {
          match: '^#\\S+',
          name: 'keyword.control.c'
        }
      ]
    },
    string: {
      name: 'string.quoted.double.haskell',
      begin: /"/,
      end: /"/,
      beginCaptures: {
        0: {
          name: 'punctuation.definition.string.begin.haskell'
        }
      },
      endCaptures: {
        0: {
          name: 'punctuation.definition.string.end.haskell'
        }
      },
      patterns: [
        {
          include: '#characters'
        }, {
          begin: /\\\s/,
          end: /\\/,
          beginCaptures: {
            0: {
              name: 'markup.other.escape.newline.begin.haskell'
            }
          },
          endCaptures: {
            0: {
              name: 'markup.other.escape.newline.end.haskell'
            }
          },
          patterns: [
            {
              include: '#invalid'
            }
          ]
        }
      ]
    },
    newline_escape: {
      name: 'markup.other.escape.newline.haskell',
      match: /\\$/
    },
    quoted_character: {
      name: 'string.quoted.single.haskell',
      match: /(')({character})(')/,
      captures: {
        1: {
          name: 'punctuation.definition.string.begin.haskell'
        },
        2: {
          patterns: [
            {
              include: '#characters'
            }
          ]
        },
        3: {
          name: 'punctuation.definition.string.end.haskell'
        }
      }
    },
    scoped_type: [
      {
        match: "\\((" + (balanced('paren', '\\(', '\\)')) + "{doubleColonOperator}" + (balanced('paren2', '\\(', '\\)')) + ")\\)",
        captures: {
          1: {
            patterns: [
              {
                include: '#haskell_expr'
              }
            ]
          }
        }
      }, {
        match: '({doubleColonOperator})' + ("((?:(?!{-|" + (guarded('<-|=|--+')) + "|$).|{-.*?-})*)"),
        captures: {
          1: {
            name: 'keyword.other.double-colon.haskell'
          },
          2: {
            name: 'meta.type-signature.haskell',
            patterns: [
              {
                include: '#type_signature'
              }
            ]
          }
        }
      }
    ],
    scoped_type_override: {
      match: '{indentBlockStart}{functionTypeDeclaration}' + ("((?:(?!{-|" + (guarded('--+')) + ").|{-.*?-})*)") + '({scoped_assignment})',
      captures: {
        2: {
          patterns: [
            {
              include: '#identifier'
            }
          ]
        },
        3: {
          name: 'keyword.other.double-colon.haskell'
        },
        4: {
          name: 'meta.type-signature.haskell',
          patterns: [
            {
              include: '#type_signature'
            }
          ]
        },
        5: {
          patterns: [
            {
              include: '#assignment_op'
            }, {
              include: '#operator'
            }
          ]
        }
      }
    },
    comma: {
      name: 'punctuation.separator.comma.haskell',
      match: /,/
    },
    lit_num: [
      {
        name: 'constant.numeric.hexfloat.haskell',
        match: "0[xX]" + (floatPattern('[0-9a-fA-F_]', '[pP]'))
      }, {
        name: 'constant.numeric.hexadecimal.haskell',
        match: '0[xX][_0-9a-fA-F]+'
      }, {
        name: 'constant.numeric.octal.haskell',
        match: '0[oO][_0-7]+'
      }, {
        name: 'constant.numeric.binary.haskell',
        match: '0[bB][_01]+'
      }, {
        name: 'constant.numeric.float.haskell',
        match: "[0-9]" + (floatPattern('[0-9_]', '[eE]'))
      }, {
        name: 'constant.numeric.decimal.haskell',
        match: '[0-9][_0-9]*'
      }
    ],
    operator: {
      name: 'keyword.operator.haskell',
      match: /{operator}/,
      captures: {
        0: {
          patterns: [
            {
              include: '#module_name_prefix'
            }, {
              name: 'support.operator.prelude.haskell',
              match: "^(" + (prelude.operators.map(function(x) {
                return x.replace(/./g, function(y) {
                  return '\\' + y;
                });
              }).join('|')) + ")$"
            }
          ]
        }
      }
    },
    infix_op: {
      name: 'entity.name.function.operator.haskell',
      match: /{operatorFun}/,
      captures: {
        0: {
          patterns: [
            {
              include: '#module_name_prefix'
            }, {
              name: 'support.operator.prelude.haskell',
              match: "^\\((" + (prelude.operators.map(function(x) {
                return x.replace(/./g, function(y) {
                  return '\\' + y;
                });
              }).join('|')) + ")\\)$"
            }
          ]
        }
      }
    },
    identifier: {
      match: '{lb}{functionName}{rb}',
      name: 'identifier.haskell',
      captures: {
        0: {
          patterns: [
            {
              include: '#module_name_prefix'
            }, {
              name: 'support.function.prelude.$1.haskell',
              match: "{lb}(" + (prelude.funct.join('|')) + "){rb}"
            }
          ]
        }
      }
    },
    type_name: {
      name: 'entity.name.type.haskell',
      match: /{lb}{className}{rb}/,
      captures: {
        0: {
          patterns: [
            {
              include: '#module_name_prefix'
            }, {
              name: 'entity.other.inherited-class.prelude.$1.haskell',
              match: "{lb}(" + (prelude.classes.join('|')) + "){rb}"
            }, {
              name: 'support.class.prelude.$1.haskell',
              match: "{lb}(" + (prelude.types.join('|')) + "){rb}"
            }
          ]
        }
      }
    },
    type_ctor: {
      name: 'entity.name.tag.haskell',
      match: /{lb}{className}{rb}/,
      captures: {
        0: {
          patterns: [
            {
              include: '#module_name_prefix'
            }, {
              name: 'support.tag.prelude.$1.haskell',
              match: "{lb}(" + (prelude.constr.join('|')) + "){rb}"
            }
          ]
        }
      }
    },
    where: {
      match: '{lb}where{rb}',
      name: 'keyword.other.haskell'
    },
    family_and_instance: {
      match: '{lb}(family|instance){rb}',
      name: 'keyword.other.haskell'
    },
    invalid: {
      match: /\S+/,
      name: 'invalid.illegal.character-not-allowed-here.haskell'
    },
    function_name: {
      name: 'entity.name.function.haskell',
      match: /{lb}{functionName}{rb}/,
      captures: {
        0: {
          patterns: [
            {
              include: '#module_name_prefix'
            }
          ]
        }
      }
    },
    assignment_op: {
      match: /=/,
      captures: {
        0: {
          name: 'keyword.operator.assignment.haskell'
        }
      }
    },
    attribute_name: {
      name: 'entity.other.attribute-name.haskell',
      match: /{lb}{functionName}{rb}/
    },
    liquidhaskell_annotation: {
      name: 'block.liquidhaskell',
      contentName: 'block.liquidhaskell.annotation',
      begin: '\\{-@(?!#)',
      end: '@-\\}',
      patterns: [
        {
          include: 'annotation.liquidhaskell.haskell'
        }
      ]
    },
    type_application: {
      name: 'other.type-application.haskell',
      match: "(<?\\s+)(@)(\\'?\\(" + (balanced('paren', '\\(', '\\)')) + "\\)|\\'?\\[" + (balanced('brack', '\\[', '\\]')) + "\\]|\"" + (balanced('quot', '"', '"')) + "\"|'{character}'|\\S+)",
      captures: {
        2: {
          patterns: [
            {
              include: '#operator'
            }
          ]
        },
        3: {
          patterns: [
            {
              include: '#type_signature'
            }
          ]
        }
      }
    },
    shebang: {
      name: 'comment.line.shebang.haskell',
      match: '^\\#\\!.*\\brunhaskell\\b.*$'
    },
    haskell_expr: [
      {
        include: '#infix_function'
      }, {
        include: '#unit'
      }, {
        include: '#empty_list'
      }, {
        include: '#quasi_quotes'
      }, {
        include: '#keywords'
      }, {
        include: '#pragma'
      }, {
        include: '#string'
      }, {
        include: '#newline_escape'
      }, {
        include: '#quoted_character'
      }, {
        include: '#comments'
      }, {
        include: '#infix_op'
      }, {
        include: '#comma'
      }, {
        include: '#lit_num'
      }, {
        include: '#scoped_type'
      }, {
        include: '#type_application'
      }, {
        include: '#operator'
      }, {
        include: '#identifier'
      }, {
        include: '#type_ctor'
      }
    ],
    common_toplevel: [
      {
        include: '#class_decl'
      }, {
        include: '#instance_decl'
      }, {
        include: '#deriving_instance_decl'
      }, {
        include: '#foreign_import'
      }, {
        include: '#regular_import'
      }, {
        include: '#data_decl'
      }, {
        include: '#type_alias'
      }, {
        include: '#c_preprocessor'
      }
    ],
    function_type_declaration_with_scoped_type: [
      {
        include: '#scoped_type_override'
      }, {
        include: '#function_type_declaration'
      }, {
        include: '#multiline_type_declaration'
      }
    ],
    haskell_toplevel: [
      {
        include: '#liquidhaskell_annotation'
      }, {
        include: '#common_toplevel'
      }, {
        include: '#function_type_declaration_with_scoped_type'
      }, {
        include: '#haskell_expr'
      }
    ],
    hsig_toplevel: [
      {
        include: '#common_toplevel'
      }, {
        include: '#function_type_declaration'
      }, {
        include: '#lazy_function_type_signature'
      }, {
        include: '#comments'
      }
    ],
    haskell_source: [
      {
        include: '#shebang'
      }, {
        include: '#module_decl'
      }, {
        include: '#haskell_toplevel'
      }
    ],
    hsig_source: [
      {
        include: '#hsig_decl'
      }, {
        include: '#hsig_toplevel'
      }
    ]
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYXJjaC8uYXRvbS9wYWNrYWdlcy9sYW5ndWFnZS1oYXNrZWxsL3NyYy9pbmNsdWRlL3JlcG9zaXRvcnkuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFdBQVI7O0VBQ1YsT0FBQSxHQUFVLE9BQUEsQ0FBUSxXQUFSOztFQUNWLE1BQXNFLE9BQUEsQ0FBUSxRQUFSLENBQXRFLEVBQUUsdUJBQUYsRUFBWSxxQkFBWixFQUFxQiwrQkFBckIsRUFBbUMscUNBQW5DLEVBQW9EOztFQUVwRCxNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsYUFBQSxFQUNFO01BQUEsUUFBQSxFQUFVO1FBQ047VUFBQSxJQUFBLEVBQU0sK0JBQU47VUFDQSxLQUFBLEVBQU8sWUFEUDtVQUVBLEdBQUEsRUFBSyxLQUZMO1VBR0EsbUJBQUEsRUFBcUIsQ0FIckI7VUFJQSxhQUFBLEVBQ0U7WUFBQSxDQUFBLEVBQUc7Y0FBQSxJQUFBLEVBQU0sZ0RBQU47YUFBSDtXQUxGO1VBTUEsV0FBQSxFQUNFO1lBQUEsQ0FBQSxFQUFHO2NBQUEsSUFBQSxFQUFNLGdEQUFOO2FBQUg7V0FQRjtVQVFBLFFBQUEsRUFBVTtZQUNOO2NBQUEsT0FBQSxFQUFTLGdCQUFUO2FBRE07V0FSVjtTQURNLEVBYU47VUFBQSxJQUFBLEVBQU0sdUJBQU47VUFDQSxLQUFBLEVBQU8sS0FEUDtVQUVBLEdBQUEsRUFBSyxLQUZMO1VBR0EsbUJBQUEsRUFBcUIsQ0FIckI7VUFJQSxhQUFBLEVBQ0U7WUFBQSxDQUFBLEVBQUc7Y0FBQSxJQUFBLEVBQU0sb0RBQU47YUFBSDtXQUxGO1VBTUEsV0FBQSxFQUNFO1lBQUEsQ0FBQSxFQUFHO2NBQUEsSUFBQSxFQUFNLGtEQUFOO2FBQUg7V0FQRjtVQVFBLFFBQUEsRUFBVTtZQUNOO2NBQUEsT0FBQSxFQUFTLGdCQUFUO2FBRE07V0FSVjtT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WDtPQUYwQyxFQUcxQztRQUFFLE9BQUEsRUFBUyw2QkFBWDtPQUgwQztLQXZ4QjVDO0lBNHhCQSxnQkFBQSxFQUFrQjtNQUNoQjtRQUFFLE9BQUEsRUFBUywyQkFBWDtPQURnQixFQUVoQjtRQUFFLE9BQUEsRUFBUyxrQkFBWDtPQUZnQixFQUdoQjtRQUFFLE9BQUEsRUFBUyw2Q0FBWDtPQUhnQixFQUloQjtRQUFFLE9BQUEsRUFBUyxlQUFYO09BSmdCO0tBNXhCbEI7SUFreUJBLGFBQUEsRUFBZTtNQUNiO1FBQUUsT0FBQSxFQUFTLGtCQUFYO09BRGEsRUFFYjtRQUFFLE9BQUEsRUFBUyw0QkFBWDtPQUZhLEVBR2I7UUFBRSxPQUFBLEVBQVMsK0JBQVg7T0FIYSxFQUliO1FBQUUsT0FBQSxFQUFTLFdBQVg7T0FKYTtLQWx5QmY7SUF3eUJBLGNBQUEsRUFBZ0I7TUFDZDtRQUFFLE9BQUEsRUFBUyxVQUFYO09BRGMsRUFFZDtRQUFFLE9BQUEsRUFBUyxjQUFYO09BRmMsRUFHZDtRQUFFLE9BQUEsRUFBUyxtQkFBWDtPQUhjO0tBeHlCaEI7SUE2eUJBLFdBQUEsRUFBYTtNQUNYO1FBQUUsT0FBQSxFQUFTLFlBQVg7T0FEVyxFQUVYO1FBQUUsT0FBQSxFQUFTLGdCQUFYO09BRlc7S0E3eUJiOztBQUxGIiwic291cmNlc0NvbnRlbnQiOlsicHJlbHVkZSA9IHJlcXVpcmUgJy4vcHJlbHVkZSdcbnByYWdtYXMgPSByZXF1aXJlICcuL3ByYWdtYXMnXG57IGJhbGFuY2VkLCBndWFyZGVkLCBmbG9hdFBhdHRlcm4sIGNvbnRyb2xLZXl3b3Jkcywgb3RoZXJLZXl3b3JkcyB9ID0gcmVxdWlyZSAnLi91dGlsJ1xuXG5tb2R1bGUuZXhwb3J0cz1cbiAgYmxvY2tfY29tbWVudDpcbiAgICBwYXR0ZXJuczogW1xuICAgICAgICBuYW1lOiAnY29tbWVudC5ibG9jay5oYWRkb2NrLmhhc2tlbGwnXG4gICAgICAgIGJlZ2luOiAvXFx7LVxccypbfF5dL1xuICAgICAgICBlbmQ6IC8tXFx9L1xuICAgICAgICBhcHBseUVuZFBhdHRlcm5MYXN0OiAxXG4gICAgICAgIGJlZ2luQ2FwdHVyZXM6XG4gICAgICAgICAgMDogbmFtZTogJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24uY29tbWVudC5oYWRkb2NrLmhhc2tlbGwnXG4gICAgICAgIGVuZENhcHR1cmVzOlxuICAgICAgICAgIDA6IG5hbWU6ICdwdW5jdHVhdGlvbi5kZWZpbml0aW9uLmNvbW1lbnQuaGFkZG9jay5oYXNrZWxsJ1xuICAgICAgICBwYXR0ZXJuczogW1xuICAgICAgICAgICAgaW5jbHVkZTogJyNibG9ja19jb21tZW50J1xuICAgICAgICBdXG4gICAgICAsXG4gICAgICAgIG5hbWU6ICdjb21tZW50LmJsb2NrLmhhc2tlbGwnXG4gICAgICAgIGJlZ2luOiAvXFx7LS9cbiAgICAgICAgZW5kOiAvLVxcfS9cbiAgICAgICAgYXBwbHlFbmRQYXR0ZXJuTGFzdDogMVxuICAgICAgICBiZWdpbkNhcHR1cmVzOlxuICAgICAgICAgIDA6IG5hbWU6ICdwdW5jdHVhdGlvbi5kZWZpbml0aW9uLmNvbW1lbnQuYmxvY2suc3RhcnQuaGFza2VsbCdcbiAgICAgICAgZW5kQ2FwdHVyZXM6XG4gICAgICAgICAgMDogbmFtZTogJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24uY29tbWVudC5ibG9jay5lbmQuaGFza2VsbCdcbiAgICAgICAgcGF0dGVybnM6IFtcbiAgICAgICAgICAgIGluY2x1ZGU6ICcjYmxvY2tfY29tbWVudCdcbiAgICAgICAgXVxuICAgIF1cbiAgY29tbWVudHM6XG4gICAgcGF0dGVybnM6IFtcbiAgICAgICAgYmVnaW46IC8oe21heWJlQmlyZFRyYWNrfVsgXFx0XSspPyg/PS0tK1xccytbfF5dKS9cbiAgICAgICAgZW5kOiAvKD8hXFxHKS9cbiAgICAgICAgcGF0dGVybnM6IFtcbiAgICAgICAgICAgIG5hbWU6ICdjb21tZW50LmxpbmUuZG91YmxlLWRhc2guaGFkZG9jay5oYXNrZWxsJ1xuICAgICAgICAgICAgYmVnaW46IC8oLS0rKVxccysoW3xeXSkvXG4gICAgICAgICAgICBlbmQ6IC8kL1xuICAgICAgICAgICAgYmVnaW5DYXB0dXJlczpcbiAgICAgICAgICAgICAgMTogbmFtZTogJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24uY29tbWVudC5oYXNrZWxsJ1xuICAgICAgICAgICAgICAyOiBuYW1lOiAncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5jb21tZW50LmhhZGRvY2suaGFza2VsbCdcbiAgICAgICAgXVxuICAgICAgLFxuICAgICAgICAjIyNcbiAgICAgICAgT3BlcmF0b3JzIG1heSBiZWdpbiB3aXRoIC0tIGFzIGxvbmcgYXMgdGhleSBhcmUgbm90XG4gICAgICAgIGVudGlyZWx5IGNvbXBvc2VkIG9mIC0gY2hhcmFjdGVycy4gVGhpcyBtZWFucyBjb21tZW50cyBjYW4ndCBiZVxuICAgICAgICBpbW1lZGlhdGVseSBmb2xsb3dlZCBieSBhbiBhbGxvd2FibGUgb3BlcmF0b3IgY2hhcmFjdGVyLlxuICAgICAgICAjIyNcbiAgICAgICAgYmVnaW46IC8oe21heWJlQmlyZFRyYWNrfVsgXFx0XSspPyg/PS0tKyg/IXtvcGVyYXRvckNoYXJ9KSkvXG4gICAgICAgIGVuZDogLyg/IVxcRykvXG4gICAgICAgIHBhdHRlcm5zOiBbXG4gICAgICAgICAgICBuYW1lOiAnY29tbWVudC5saW5lLmRvdWJsZS1kYXNoLmhhc2tlbGwnXG4gICAgICAgICAgICBiZWdpbjogLy0tL1xuICAgICAgICAgICAgZW5kOiAvJC9cbiAgICAgICAgICAgIGJlZ2luQ2FwdHVyZXM6XG4gICAgICAgICAgICAgIDA6IG5hbWU6ICdwdW5jdHVhdGlvbi5kZWZpbml0aW9uLmNvbW1lbnQuaGFza2VsbCdcbiAgICAgICAgXVxuICAgICAgLFxuICAgICAgICBpbmNsdWRlOiAnI2Jsb2NrX2NvbW1lbnQnXG4gICAgXVxuICBjaGFyYWN0ZXJzOlxuICAgIHBhdHRlcm5zOiBbXG4gICAgICAgIHttYXRjaDogJ3tlc2NhcGVDaGFyfScsIG5hbWU6ICdjb25zdGFudC5jaGFyYWN0ZXIuZXNjYXBlLmhhc2tlbGwnfVxuICAgICAgICB7bWF0Y2g6ICd7b2N0YWxDaGFyfScsIG5hbWU6ICdjb25zdGFudC5jaGFyYWN0ZXIuZXNjYXBlLm9jdGFsLmhhc2tlbGwnfVxuICAgICAgICB7bWF0Y2g6ICd7aGV4Q2hhcn0nLCBuYW1lOiAnY29uc3RhbnQuY2hhcmFjdGVyLmVzY2FwZS5oZXhhZGVjaW1hbC5oYXNrZWxsJ31cbiAgICAgICAge21hdGNoOiAne2NvbnRyb2xDaGFyfScsIG5hbWU6ICdjb25zdGFudC5jaGFyYWN0ZXIuZXNjYXBlLmNvbnRyb2wuaGFza2VsbCd9XG4gICAgICBdXG4gIG1vZHVsZV9leHBvcnRzOlxuICAgIG5hbWU6ICdtZXRhLmRlY2xhcmF0aW9uLmV4cG9ydHMuaGFza2VsbCdcbiAgICBiZWdpbjogL1xcKC9cbiAgICBlbmQ6IC9cXCkvXG4gICAgYXBwbHlFbmRQYXR0ZXJuTGFzdDogMVxuICAgIHBhdHRlcm5zOiBbXG4gICAgICAgIGluY2x1ZGU6ICcjY29tbWVudHMnXG4gICAgICAsXG4gICAgICAgIGluY2x1ZGU6ICcjY19wcmVwcm9jZXNzb3InXG4gICAgICAsXG4gICAgICAgIGJlZ2luOiAve2xifShtb2R1bGUpe3JifS9cbiAgICAgICAgZW5kOiAve2xifSh7Y2xhc3NOYW1lfSl7cmJ9L1xuICAgICAgICBiZWdpbkNhcHR1cmVzOlxuICAgICAgICAgIDE6IG5hbWU6ICdrZXl3b3JkLm90aGVyLmhhc2tlbGwnXG4gICAgICAgIGVuZENhcHR1cmVzOlxuICAgICAgICAgIDE6IG5hbWU6ICdzdXBwb3J0Lm90aGVyLm1vZHVsZS5oYXNrZWxsJ1xuICAgICAgICBwYXR0ZXJuczogW1xuICAgICAgICAgICAge2luY2x1ZGU6ICcjaW52YWxpZCd9XG4gICAgICAgIF1cbiAgICAgICxcbiAgICAgICAgaW5jbHVkZTogJyNmdW5jdGlvbl9uYW1lJ1xuICAgICAgLFxuICAgICAgICBpbmNsdWRlOiAnI3R5cGVfbmFtZSdcbiAgICAgICxcbiAgICAgICAgaW5jbHVkZTogJyNjb21tYSdcbiAgICAgICxcbiAgICAgICAgaW5jbHVkZTogJyNpbmZpeF9vcCdcbiAgICAgICxcbiAgICAgICAgbmFtZTogJ21ldGEub3RoZXIuY29uc3RydWN0b3ItbGlzdC5oYXNrZWxsJ1xuICAgICAgICBiZWdpbjogL1xcKC9cbiAgICAgICAgZW5kOiAvXFwpL1xuICAgICAgICBwYXR0ZXJuczogW1xuICAgICAgICAgIHsgaW5jbHVkZTogJyNjb21tZW50cycgfVxuICAgICAgICAgIHsgaW5jbHVkZTogJyNjX3ByZXByb2Nlc3NvcicgfVxuICAgICAgICAgIHsgaW5jbHVkZTogJyN0eXBlX2N0b3InIH1cbiAgICAgICAgICB7IGluY2x1ZGU6ICcjYXR0cmlidXRlX25hbWUnIH1cbiAgICAgICAgICB7IGluY2x1ZGU6ICcjY29tbWEnIH1cbiAgICAgICAgICB7XG4gICAgICAgICAgICBtYXRjaDogL1xcLlxcLi9cbiAgICAgICAgICAgIG5hbWU6ICdrZXl3b3JkLm9wZXJhdG9yLndpbGRjYXJkLmhhc2tlbGwnXG4gICAgICAgICAgfVxuICAgICAgICAgIHtpbmNsdWRlOiAnI2luZml4X29wJ31cbiAgICAgICAgXVxuICAgIF1cbiAgbW9kdWxlX25hbWU6XG4gICAgbmFtZTogJ3N1cHBvcnQub3RoZXIubW9kdWxlLmhhc2tlbGwnXG4gICAgbWF0Y2g6IC97bGJ9e2NsYXNzTmFtZX17cmJ9L1xuICBtb2R1bGVfbmFtZV9wcmVmaXg6XG4gICAgbmFtZTogJ3N1cHBvcnQub3RoZXIubW9kdWxlLmhhc2tlbGwnXG4gICAgbWF0Y2g6IC97bGJ9e2NsYXNzTmFtZX1cXC4vXG4gIHByYWdtYTpcbiAgICBuYW1lOiAnbWV0YS5wcmVwcm9jZXNzb3IuaGFza2VsbCdcbiAgICBiZWdpbjogL1xcey0jL1xuICAgIGVuZDogLyMtXFx9L1xuICAgIHBhdHRlcm5zOiBbXG4gICAgICAgIG1hdGNoOiBcIntsYn0oKD9pOiN7cHJhZ21hcy5qb2luKCd8Jyl9KSl7cmJ9XCJcbiAgICAgICAgbmFtZTogJ2tleXdvcmQub3RoZXIucHJlcHJvY2Vzc29yLmhhc2tlbGwnXG4gICAgXVxuICBmdW5jdGlvbl90eXBlX2RlY2xhcmF0aW9uOlxuICAgIG5hbWU6ICdtZXRhLmZ1bmN0aW9uLnR5cGUtZGVjbGFyYXRpb24uaGFza2VsbCdcbiAgICBiZWdpbjogL3tpbmRlbnRCbG9ja1N0YXJ0fXtmdW5jdGlvblR5cGVEZWNsYXJhdGlvbn0vXG4gICAgZW5kOiAne2luZGVudEJsb2NrRW5kfXwoPz17c2NvcGVkX2Fzc2lnbm1lbnR9KSdcbiAgICBjb250ZW50TmFtZTogJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCdcbiAgICBiZWdpbkNhcHR1cmVzOlxuICAgICAgMjpcbiAgICAgICAgcGF0dGVybnM6IFtcbiAgICAgICAgICAgIHtpbmNsdWRlOiAnI2Z1bmN0aW9uX25hbWUnfVxuICAgICAgICAgICAge2luY2x1ZGU6ICcjaW5maXhfb3AnfVxuICAgICAgICBdXG4gICAgICAzOiBuYW1lOiAna2V5d29yZC5vdGhlci5kb3VibGUtY29sb24uaGFza2VsbCdcbiAgICBwYXR0ZXJuczogW1xuICAgICAgICBpbmNsdWRlOiAnI3R5cGVfc2lnbmF0dXJlJ1xuICAgIF1cbiAgbXVsdGlsaW5lX3R5cGVfZGVjbGFyYXRpb246XG4gICAgbmFtZTogJ21ldGEubXVsdGlsaW5lLnR5cGUtZGVjbGFyYXRpb24uaGFza2VsbCdcbiAgICBiZWdpbjogL3tpbmRlbnRCbG9ja1N0YXJ0fSh7ZG91YmxlQ29sb25PcGVyYXRvcn0pL1xuICAgIGVuZDogJ3tpbmRlbnRCbG9ja0NvbnR9fCg/PXtzY29wZWRfYXNzaWdubWVudH0pJ1xuICAgIGNvbnRlbnROYW1lOiAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJ1xuICAgIGJlZ2luQ2FwdHVyZXM6XG4gICAgICAyOiBuYW1lOiAna2V5d29yZC5vdGhlci5kb3VibGUtY29sb24uaGFza2VsbCdcbiAgICBwYXR0ZXJuczogW1xuICAgICAge2luY2x1ZGU6ICcjdHlwZV9zaWduYXR1cmUnfVxuICAgIF1cbiAgbGF6eV9mdW5jdGlvbl90eXBlX3NpZ25hdHVyZTpcbiAgICBuYW1lOiAnbWV0YS5mdW5jdGlvbi50eXBlLWRlY2xhcmF0aW9uLmhhc2tlbGwnXG4gICAgYmVnaW46IC97aW5kZW50QmxvY2tTdGFydH0oe2Z1bmN0aW9uTGlzdH0pXFxzKiQvXG4gICAgZW5kOiAve2luZGVudEJsb2NrRW5kfS9cbiAgICBjb250ZW50TmFtZTogJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCdcbiAgICBiZWdpbkNhcHR1cmVzOlxuICAgICAgMjpcbiAgICAgICAgcGF0dGVybnM6IFtcbiAgICAgICAgICAgIHtpbmNsdWRlOiAnI2Z1bmN0aW9uX25hbWUnfVxuICAgICAgICAgICAge2luY2x1ZGU6ICcjaW5maXhfb3AnfVxuICAgICAgICBdXG4gICAgcGF0dGVybnM6IFtcbiAgICAgICAge2luY2x1ZGU6ICcjZG91YmxlX2NvbG9uX29wZXJhdG9yJ31cbiAgICAgICAge2luY2x1ZGU6ICcjdHlwZV9zaWduYXR1cmUnfVxuICAgIF1cbiAgZG91YmxlX2NvbG9uX29wZXJhdG9yOlxuICAgIG5hbWU6ICdrZXl3b3JkLm90aGVyLmRvdWJsZS1jb2xvbi5oYXNrZWxsJ1xuICAgIG1hdGNoOiAne2RvdWJsZUNvbG9uT3BlcmF0b3J9J1xuICBjdG9yX3R5cGVfZGVjbGFyYXRpb246XG4gICAgbmFtZTogJ21ldGEuY3Rvci50eXBlLWRlY2xhcmF0aW9uLmhhc2tlbGwnXG4gICAgYmVnaW46IC97aW5kZW50QmxvY2tTdGFydH17Y3RvclR5cGVEZWNsYXJhdGlvbn0vXG4gICAgZW5kOiAve2luZGVudEJsb2NrRW5kfS9cbiAgICBjb250ZW50TmFtZTogJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCdcbiAgICBiZWdpbkNhcHR1cmVzOlxuICAgICAgMjpcbiAgICAgICAgcGF0dGVybnM6IFtcbiAgICAgICAgICAgIGluY2x1ZGU6ICcjdHlwZV9jdG9yJ1xuICAgICAgICAgICxcbiAgICAgICAgICAgIGluY2x1ZGU6ICcjaW5maXhfb3AnXG4gICAgICAgIF1cbiAgICAgIDM6IG5hbWU6ICdrZXl3b3JkLm90aGVyLmRvdWJsZS1jb2xvbi5oYXNrZWxsJ1xuICAgIHBhdHRlcm5zOiBbXG4gICAgICAgIGluY2x1ZGU6ICcjdHlwZV9zaWduYXR1cmUnXG4gICAgXVxuICByZWNvcmRfZmllbGRfZGVjbGFyYXRpb246XG4gICAgbmFtZTogJ21ldGEucmVjb3JkLWZpZWxkLnR5cGUtZGVjbGFyYXRpb24uaGFza2VsbCdcbiAgICBiZWdpbjogL3tsYn17ZnVuY3Rpb25UeXBlRGVjbGFyYXRpb259L1xuICAgIGVuZDogLyg/PXtmdW5jdGlvblR5cGVEZWNsYXJhdGlvbn18fSkvXG4gICAgY29udGVudE5hbWU6ICdtZXRhLnR5cGUtc2lnbmF0dXJlLmhhc2tlbGwnXG4gICAgYmVnaW5DYXB0dXJlczpcbiAgICAgIDE6XG4gICAgICAgIHBhdHRlcm5zOiBbXG4gICAgICAgICAgICBpbmNsdWRlOiAnI2F0dHJpYnV0ZV9uYW1lJ1xuICAgICAgICAgICxcbiAgICAgICAgICAgIGluY2x1ZGU6ICcjaW5maXhfb3AnXG4gICAgICAgIF1cbiAgICAgIDI6IG5hbWU6ICdrZXl3b3JkLm90aGVyLmRvdWJsZS1jb2xvbi5oYXNrZWxsJ1xuICAgIHBhdHRlcm5zOiBbXG4gICAgICAgIGluY2x1ZGU6ICcjdHlwZV9zaWduYXR1cmUnXG4gICAgXVxuICB0eXBlX3NpZ25hdHVyZTpcbiAgICBwYXR0ZXJuczogW1xuICAgICAgI1RPRE86IFR5cGUgb3BlcmF0b3JzLCB0eXBlLWxldmVsIGludGVnZXJzIGV0Y1xuICAgICAgICBpbmNsdWRlOiAnI3ByYWdtYSdcbiAgICAgICxcbiAgICAgICAgaW5jbHVkZTogJyNjb21tZW50cydcbiAgICAgICxcbiAgICAgICAgbmFtZTogJ2tleXdvcmQub3RoZXIuZm9yYWxsLmhhc2tlbGwnXG4gICAgICAgIG1hdGNoOiAne2xifWZvcmFsbHtyYn0nXG4gICAgICAsXG4gICAgICAgIGluY2x1ZGU6ICcjcXVvdGVkX2NoYXJhY3RlcidcbiAgICAgICxcbiAgICAgICAgbWF0Y2g6IC8nKFxcKFxcKSkvXG4gICAgICAgIG5hbWU6ICdvdGhlci5wcm9tb3RlZC5oYXNrZWxsJ1xuICAgICAgICBjYXB0dXJlczogMTogcGF0dGVybnM6IFtcbiAgICAgICAgICB7aW5jbHVkZTogJyN1bml0J31cbiAgICAgICAgXVxuICAgICAgLFxuICAgICAgICBpbmNsdWRlOiAnI3VuaXQnXG4gICAgICAsXG4gICAgICAgIG1hdGNoOiAvJyhcXFtcXF0pL1xuICAgICAgICBuYW1lOiAnb3RoZXIucHJvbW90ZWQuaGFza2VsbCdcbiAgICAgICAgY2FwdHVyZXM6IDE6IHBhdHRlcm5zOiBbXG4gICAgICAgICAge2luY2x1ZGU6ICcjZW1wdHlfbGlzdCd9XG4gICAgICAgIF1cbiAgICAgICxcbiAgICAgICAgaW5jbHVkZTogJyNlbXB0eV9saXN0J1xuICAgICAgLFxuICAgICAgICBpbmNsdWRlOiAnI3N0cmluZydcbiAgICAgICxcbiAgICAgICAgaW5jbHVkZTogJyNhcnJvdydcbiAgICAgICxcbiAgICAgICAgaW5jbHVkZTogJyNiaWdfYXJyb3cnXG4gICAgICAsXG4gICAgICAgIG1hdGNoOiBcIicoe29wZXJhdG9yfSlcIlxuICAgICAgICBuYW1lOiAnb3RoZXIucHJvbW90ZWQuaGFza2VsbCdcbiAgICAgICAgY2FwdHVyZXM6IDE6IHBhdHRlcm5zOiBbXG4gICAgICAgICAge2luY2x1ZGU6ICcjb3BlcmF0b3InfVxuICAgICAgICBdXG4gICAgICAsXG4gICAgICAgIGluY2x1ZGU6ICcjb3BlcmF0b3InXG4gICAgICAsXG4gICAgICAgIGluY2x1ZGU6ICcjdHlwZV92YXJpYWJsZSdcbiAgICAgICxcbiAgICAgICAgbmFtZTogJ290aGVyLnByb21vdGVkLmhhc2tlbGwnXG4gICAgICAgIG1hdGNoOiAve2xicmVsfScoe2NsYXNzTmFtZX0pe3JifS9cbiAgICAgICAgY2FwdHVyZXM6IDE6IHBhdHRlcm5zOiBbXG4gICAgICAgICAgaW5jbHVkZTogJyN0eXBlX25hbWUnXG4gICAgICAgIF1cbiAgICAgICxcbiAgICAgICAgaW5jbHVkZTogJyN0eXBlX25hbWUnXG4gICAgICAsXG4gICAgICAgIGluY2x1ZGU6ICcjbGl0X251bSdcbiAgICBdXG4gIGFycm93OlxuICAgIG5hbWU6ICdrZXl3b3JkLm90aGVyLmFycm93Lmhhc2tlbGwnXG4gICAgbWF0Y2g6ICd7YXJyb3d9J1xuICBiaWdfYXJyb3c6XG4gICAgbmFtZTogJ2tleXdvcmQub3RoZXIuYmlnLWFycm93Lmhhc2tlbGwnXG4gICAgbWF0Y2g6ICd7YmlnX2Fycm93fSdcbiAgdHlwZV92YXJpYWJsZTpcbiAgICBuYW1lOiAndmFyaWFibGUub3RoZXIuZ2VuZXJpYy10eXBlLmhhc2tlbGwnXG4gICAgbWF0Y2g6IC97bGJ9e2Z1bmN0aW9uTmFtZX17cmJ9L1xuICB1bml0OlxuICAgIG5hbWU6ICdjb25zdGFudC5sYW5ndWFnZS51bml0Lmhhc2tlbGwnXG4gICAgbWF0Y2g6IC9cXChcXCkvXG4gIGVtcHR5X2xpc3Q6XG4gICAgbmFtZTogJ2NvbnN0YW50Lmxhbmd1YWdlLmVtcHR5LWxpc3QuaGFza2VsbCdcbiAgICBtYXRjaDogL1xcW1xcXS9cbiAgZGVyaXZpbmc6XG4gICAgcGF0dGVybnM6IFtcbiAgICAgICAge2luY2x1ZGU6ICcjZGVyaXZpbmdfbGlzdCd9XG4gICAgICAgIHtpbmNsdWRlOiAnI2Rlcml2aW5nX3NpbXBsZSd9XG4gICAgICAgIHtpbmNsdWRlOiAnI2Rlcml2aW5nX2tleXdvcmQnfVxuICAgIF1cbiAgZGVyaXZpbmdfc3RyYXRlZ2llczpcbiAgICBuYW1lOiAnbWV0YS5kZXJpdmluZy5zdHJhdGVneS5oYXNrZWxsJ1xuICAgIG1hdGNoOiAne2xifShzdG9ja3xuZXd0eXBlfGFueWNsYXNzKXtyYn0nXG4gICAgY2FwdHVyZXM6XG4gICAgICAxOiBuYW1lOiAna2V5d29yZC5vdGhlci5oYXNrZWxsJ1xuICBkZXJpdmluZ19rZXl3b3JkOlxuICAgIG5hbWU6ICdtZXRhLmRlcml2aW5nLmhhc2tlbGwnXG4gICAgbWF0Y2g6IC97bGJ9e2Rlcml2aW5nfXtyYn0vXG4gICAgY2FwdHVyZXM6XG4gICAgICAxOiBuYW1lOiAna2V5d29yZC5vdGhlci5oYXNrZWxsJ1xuICAgICAgMjogcGF0dGVybnM6IFt7aW5jbHVkZTogJyNkZXJpdmluZ19zdHJhdGVnaWVzJ31dXG4gIGRlcml2aW5nX2xpc3Q6XG4gICAgbmFtZTogJ21ldGEuZGVyaXZpbmcuaGFza2VsbCdcbiAgICBiZWdpbjogL3tsYn17ZGVyaXZpbmd9XFxzKlxcKC9cbiAgICBlbmQ6IC9cXCkvXG4gICAgYmVnaW5DYXB0dXJlczpcbiAgICAgIDE6IG5hbWU6ICdrZXl3b3JkLm90aGVyLmhhc2tlbGwnXG4gICAgICAyOiBwYXR0ZXJuczogW3tpbmNsdWRlOiAnI2Rlcml2aW5nX3N0cmF0ZWdpZXMnfV1cbiAgICBwYXR0ZXJuczogW1xuICAgICAgICBtYXRjaDogL3tsYn0oe2NsYXNzTmFtZX0pe3JifS9cbiAgICAgICAgY2FwdHVyZXM6XG4gICAgICAgICAgMTogbmFtZTogJ2VudGl0eS5vdGhlci5pbmhlcml0ZWQtY2xhc3MuaGFza2VsbCdcbiAgICBdXG4gIGRlcml2aW5nX3NpbXBsZTpcbiAgICBuYW1lOiAnbWV0YS5kZXJpdmluZy5oYXNrZWxsJ1xuICAgIG1hdGNoOiAve2xifXtkZXJpdmluZ31cXHMqKHtjbGFzc05hbWV9KXtyYn0vXG4gICAgY2FwdHVyZXM6XG4gICAgICAxOiBuYW1lOiAna2V5d29yZC5vdGhlci5oYXNrZWxsJ1xuICAgICAgMjogcGF0dGVybnM6IFt7aW5jbHVkZTogJyNkZXJpdmluZ19zdHJhdGVnaWVzJ31dXG4gICAgICAzOiBuYW1lOiAnZW50aXR5Lm90aGVyLmluaGVyaXRlZC1jbGFzcy5oYXNrZWxsJ1xuICB2aWE6XG4gICAgcGF0dGVybnM6IFtcbiAgICAgICAge2luY2x1ZGU6ICcjdmlhX2xpc3QnfVxuICAgICAgICB7aW5jbHVkZTogJyN2aWFfbGlzdF9uZXdsaW5lJ31cbiAgICAgICAge2luY2x1ZGU6ICcjdmlhX2luZGVudCd9XG4gICAgICAgIHtpbmNsdWRlOiAnI3ZpYV9zaW1wbGUnfVxuICAgICAgICB7aW5jbHVkZTogJyN2aWFfa2V5d29yZCd9XG4gICAgXVxuICB2aWFfa2V5d29yZDpcbiAgICBuYW1lOiAnbWV0YS52aWEuaGFza2VsbCdcbiAgICBtYXRjaDogL3tsYn0odmlhKXtyYn0vXG4gICAgY2FwdHVyZXM6XG4gICAgICAxOiBuYW1lOiAna2V5d29yZC5vdGhlci5oYXNrZWxsJ1xuICB2aWFfc2ltcGxlOlxuICAgIG5hbWU6ICdtZXRhLnZpYS5oYXNrZWxsJ1xuICAgIG1hdGNoOiAve2xifSh2aWEpXFxzKih7Y2xhc3NOYW1lfSl7cmJ9L1xuICAgIGNhcHR1cmVzOlxuICAgICAgMTogbmFtZTogJ2tleXdvcmQub3RoZXIuaGFza2VsbCdcbiAgICAgIDI6IHBhdHRlcm5zOiBbaW5jbHVkZTogXCIjdHlwZV9zaWduYXR1cmVcIl1cbiAgdmlhX2xpc3Q6XG4gICAgbmFtZTogJ21ldGEudmlhLmhhc2tlbGwnXG4gICAgYmVnaW46IC97bGJ9KHZpYSlcXHMqXFwoL1xuICAgIGVuZDogL1xcKS9cbiAgICBiZWdpbkNhcHR1cmVzOlxuICAgICAgMTogbmFtZTogJ2tleXdvcmQub3RoZXIuaGFza2VsbCdcbiAgICBwYXR0ZXJuczogW1xuICAgICAgICB7aW5jbHVkZTogXCIjdHlwZV9zaWduYXR1cmVcIn1cbiAgICBdXG4gIHZpYV9saXN0X25ld2xpbmU6XG4gICAgbmFtZTogJ21ldGEudmlhLmhhc2tlbGwnXG4gICAgYmVnaW46IC97bGJ9KHZpYSlcXHMqL1xuICAgIGVuZDogLyQvXG4gICAgYmVnaW5DYXB0dXJlczpcbiAgICAgIDE6IG5hbWU6ICdrZXl3b3JkLm90aGVyLmhhc2tlbGwnXG4gICAgcGF0dGVybnM6IFtcbiAgICAgICAge2luY2x1ZGU6IFwiI3R5cGVfc2lnbmF0dXJlXCJ9XG4gICAgXVxuICB2aWFfaW5kZW50OlxuICAgIG5hbWU6ICdtZXRhLnZpYS5oYXNrZWxsJ1xuICAgIGJlZ2luOiAve2luZGVudEJsb2NrU3RhcnR9KHZpYSlcXHMqL1xuICAgIGVuZDogL3tpbmRlbnRCbG9ja0NvbnR9L1xuICAgIGJlZ2luQ2FwdHVyZXM6XG4gICAgICAyOiBuYW1lOiAna2V5d29yZC5vdGhlci5oYXNrZWxsJ1xuICAgIHBhdHRlcm5zOiBbXG4gICAgICAgIHtpbmNsdWRlOiBcIiN0eXBlX3NpZ25hdHVyZVwifVxuICAgIF1cbiAgaW5maXhfZnVuY3Rpb246XG4gICAgbmFtZTogJ2tleXdvcmQub3BlcmF0b3IuZnVuY3Rpb24uaW5maXguaGFza2VsbCdcbiAgICBtYXRjaDogLyhgKXtmdW5jdGlvbk5hbWV9KGApL1xuICAgIGNhcHR1cmVzOlxuICAgICAgMTogbmFtZTogJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24uZW50aXR5Lmhhc2tlbGwnXG4gICAgICAyOiBuYW1lOiAncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5lbnRpdHkuaGFza2VsbCdcbiAgcXVhc2lfcXVvdGVzOlxuICAgIGJlZ2luOiAvKFxcWykoKD86e2NsYXNzTmFtZX1cXC4pPyh7ZnVuY3Rpb25OYW1lT25lfSkpKFxcfCkvXG4gICAgZW5kOiAvKFxcfCkoXFxdKS9cbiAgICBiZWdpbkNhcHR1cmVzOlxuICAgICAgMTogbmFtZTogJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24ucXVhc2lxdW90ZXMuYmVnaW4uaGFza2VsbCdcbiAgICAgIDI6XG4gICAgICAgIG5hbWU6ICdlbnRpdHkubmFtZS50YWcuaGFza2VsbCdcbiAgICAgICAgcGF0dGVybnM6IHsgaW5jbHVkZTogJyNtb2R1bGVfbmFtZV9wcmVmaXgnIH1cbiAgICBlbmRDYXB0dXJlczpcbiAgICAgIDI6IG5hbWU6ICdwdW5jdHVhdGlvbi5kZWZpbml0aW9uLnF1YXNpcXVvdGVzLmVuZC5oYXNrZWxsJ1xuICAgIGNvbnRlbnROYW1lOiAncXVvdGVkLnF1YXNpcXVvdGVzLnFxLSQzLmhhc2tlbGwnXG4gIG1vZHVsZV9kZWNsOlxuICAgIG5hbWU6ICdtZXRhLmRlY2xhcmF0aW9uLm1vZHVsZS5oYXNrZWxsJ1xuICAgIGJlZ2luOiAve2luZGVudEJsb2NrU3RhcnR9KG1vZHVsZSl7cmJ9L1xuICAgIGVuZDogL3tsYn0od2hlcmUpe3JifXx7aW5kZW50QmxvY2tFbmR9L1xuICAgIGJlZ2luQ2FwdHVyZXM6XG4gICAgICAyOiBuYW1lOiAna2V5d29yZC5vdGhlci5oYXNrZWxsJ1xuICAgIGVuZENhcHR1cmVzOlxuICAgICAgMTogbmFtZTogJ2tleXdvcmQub3RoZXIuaGFza2VsbCdcbiAgICBwYXR0ZXJuczogW1xuICAgICAgICB7aW5jbHVkZTogJyNjb21tZW50cyd9XG4gICAgICAgIHtpbmNsdWRlOiAnI21vZHVsZV9uYW1lJ31cbiAgICAgICAge2luY2x1ZGU6ICcjbW9kdWxlX2V4cG9ydHMnfVxuICAgICAgICB7aW5jbHVkZTogJyNpbnZhbGlkJ31cbiAgICBdXG4gIGhzaWdfZGVjbDpcbiAgICBuYW1lOiAnbWV0YS5kZWNsYXJhdGlvbi5tb2R1bGUuaGFza2VsbCdcbiAgICBiZWdpbjogL3tpbmRlbnRCbG9ja1N0YXJ0fShzaWduYXR1cmUpe3JifS9cbiAgICBlbmQ6IC97bGJ9KHdoZXJlKXtyYn18e2luZGVudEJsb2NrRW5kfS9cbiAgICBiZWdpbkNhcHR1cmVzOlxuICAgICAgMjogbmFtZTogJ2tleXdvcmQub3RoZXIuaGFza2VsbCdcbiAgICBlbmRDYXB0dXJlczpcbiAgICAgIDE6IG5hbWU6ICdrZXl3b3JkLm90aGVyLmhhc2tlbGwnXG4gICAgcGF0dGVybnM6IFtcbiAgICAgICAge2luY2x1ZGU6ICcjY29tbWVudHMnfVxuICAgICAgICB7aW5jbHVkZTogJyNtb2R1bGVfbmFtZSd9XG4gICAgICAgIHtpbmNsdWRlOiAnI21vZHVsZV9leHBvcnRzJ31cbiAgICAgICAge2luY2x1ZGU6ICcjaW52YWxpZCd9XG4gICAgXVxuICBjbGFzc19kZWNsOlxuICAgIG5hbWU6ICdtZXRhLmRlY2xhcmF0aW9uLmNsYXNzLmhhc2tlbGwnXG4gICAgYmVnaW46IC97aW5kZW50QmxvY2tTdGFydH0oY2xhc3Mpe3JifS9cbiAgICBlbmQ6IC97bGJ9KHdoZXJlKXtyYn18e2luZGVudEJsb2NrRW5kfS9cbiAgICBiZWdpbkNhcHR1cmVzOlxuICAgICAgMjogbmFtZTogJ2tleXdvcmQub3RoZXIuY2xhc3MuaGFza2VsbCdcbiAgICBlbmRDYXB0dXJlczpcbiAgICAgIDE6IG5hbWU6ICdrZXl3b3JkLm90aGVyLmhhc2tlbGwnXG4gICAgcGF0dGVybnM6IFtcbiAgICAgICAgaW5jbHVkZTogJyN0eXBlX3NpZ25hdHVyZSdcbiAgICBdXG4gIGluc3RhbmNlX2RlY2w6XG4gICAgbmFtZTogJ21ldGEuZGVjbGFyYXRpb24uaW5zdGFuY2UuaGFza2VsbCdcbiAgICBiZWdpbjogL3tpbmRlbnRCbG9ja1N0YXJ0fShpbnN0YW5jZSl7cmJ9L1xuICAgIGVuZDogL3tsYn0od2hlcmUpe3JifXx7aW5kZW50QmxvY2tFbmR9L1xuICAgIGNvbnRlbnROYW1lOiAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJ1xuICAgIGJlZ2luQ2FwdHVyZXM6XG4gICAgICAyOiBuYW1lOiAna2V5d29yZC5vdGhlci5oYXNrZWxsJ1xuICAgIGVuZENhcHR1cmVzOlxuICAgICAgMTogbmFtZTogJ2tleXdvcmQub3RoZXIuaGFza2VsbCdcbiAgICBwYXR0ZXJuczogW1xuICAgICAgICB7aW5jbHVkZTogJyNwcmFnbWEnfVxuICAgICAgICB7aW5jbHVkZTogJyN0eXBlX3NpZ25hdHVyZSd9XG4gICAgXVxuICBkZXJpdmluZ19pbnN0YW5jZV9kZWNsOlxuICAgIG5hbWU6ICdtZXRhLmRlY2xhcmF0aW9uLmluc3RhbmNlLmRlcml2aW5nLmhhc2tlbGwnXG4gICAgYmVnaW46IC97aW5kZW50QmxvY2tTdGFydH0oPzp7ZGVyaXZpbmd9XFxzK3woZGVyaXZpbmcpXFxzKyh2aWEpXFxzKyguKilcXHMrKT8oaW5zdGFuY2Upe3JifS9cbiAgICBlbmQ6IC97aW5kZW50QmxvY2tFbmR9L1xuICAgIGNvbnRlbnROYW1lOiAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJ1xuICAgIGJlZ2luQ2FwdHVyZXM6XG4gICAgICAyOiBuYW1lOiAna2V5d29yZC5vdGhlci5oYXNrZWxsJyAjIGRlcml2aW5nXG4gICAgICAzOiBwYXR0ZXJuczogW3tpbmNsdWRlOiAnI2Rlcml2aW5nX3N0cmF0ZWdpZXMnfV0gIyBzdHJhZ2VneVxuICAgICAgNDogbmFtZTogJ2tleXdvcmQub3RoZXIuaGFza2VsbCcgIyBkZXJpdmluZ1xuICAgICAgNTogbmFtZTogJ2tleXdvcmQub3RoZXIuaGFza2VsbCcgIyB2aWFcbiAgICAgIDY6IHsgIyBzaWdcbiAgICAgICAgbmFtZTogJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCdcbiAgICAgICAgcGF0dGVybnM6IFt7aW5jbHVkZTogJyN0eXBlX3NpZ25hdHVyZSd9XVxuICAgICAgfVxuICAgICAgNzogbmFtZTogJ2tleXdvcmQub3RoZXIuaGFza2VsbCcgI2luc3RhbmNlXG4gICAgcGF0dGVybnM6IFtcbiAgICAgICAge2luY2x1ZGU6ICcjcHJhZ21hJ31cbiAgICAgICAge2luY2x1ZGU6ICcjdHlwZV9zaWduYXR1cmUnfVxuICAgIF1cbiAgZm9yZWlnbl9pbXBvcnQ6XG4gICAgbmFtZTogJ21ldGEuZm9yZWlnbi5oYXNrZWxsJ1xuICAgIGJlZ2luOiAve2luZGVudEJsb2NrU3RhcnR9KGZvcmVpZ24pXFxzKyhpbXBvcnR8ZXhwb3J0KXtyYn0vXG4gICAgZW5kOiAve2luZGVudEJsb2NrRW5kfS9cbiAgICBiZWdpbkNhcHR1cmVzOlxuICAgICAgMjogbmFtZTogJ2tleXdvcmQub3RoZXIuaGFza2VsbCdcbiAgICAgIDM6IG5hbWU6ICdrZXl3b3JkLm90aGVyLmhhc2tlbGwnXG4gICAgcGF0dGVybnM6W1xuICAgICAgICBtYXRjaDogLyg/OnVuKT9zYWZlL1xuICAgICAgICBjYXB0dXJlczpcbiAgICAgICAgICAwOiBuYW1lOiAna2V5d29yZC5vdGhlci5oYXNrZWxsJ1xuICAgICAgLFxuICAgICAgICBpbmNsdWRlOiAnI2Z1bmN0aW9uX3R5cGVfZGVjbGFyYXRpb24nXG4gICAgICAsXG4gICAgICAgIGluY2x1ZGU6ICcjaGFza2VsbF9leHByJ1xuICAgICAgLFxuICAgICAgICBpbmNsdWRlOiAnI2NvbW1lbnRzJ1xuICAgIF1cbiAgcmVndWxhcl9pbXBvcnQ6XG4gICAgbmFtZTogJ21ldGEuaW1wb3J0Lmhhc2tlbGwnXG4gICAgYmVnaW46IC97aW5kZW50QmxvY2tTdGFydH0oaW1wb3J0KXtyYn0vXG4gICAgZW5kOiAve2luZGVudEJsb2NrRW5kfS9cbiAgICBiZWdpbkNhcHR1cmVzOlxuICAgICAgMjogbmFtZTogJ2tleXdvcmQub3RoZXIuaGFza2VsbCdcbiAgICBwYXR0ZXJuczogW1xuICAgICAgICBpbmNsdWRlOiAnI21vZHVsZV9uYW1lJ1xuICAgICAgLFxuICAgICAgICBpbmNsdWRlOiAnI21vZHVsZV9leHBvcnRzJ1xuICAgICAgLFxuICAgICAgICBtYXRjaDogL3tsYn0ocXVhbGlmaWVkfGFzfGhpZGluZyl7cmJ9L1xuICAgICAgICBjYXB0dXJlczpcbiAgICAgICAgICAxOiBuYW1lOiAna2V5d29yZC5vdGhlci5oYXNrZWxsJ1xuICAgICAgLFxuICAgICAgICBpbmNsdWRlOiAnI2NvbW1lbnRzJ1xuICAgIF1cbiAgZGF0YV9kZWNsOlxuICAgIG5hbWU6ICdtZXRhLmRlY2xhcmF0aW9uLnR5cGUuZGF0YS5oYXNrZWxsJ1xuICAgIGJlZ2luOiAve2luZGVudEJsb2NrU3RhcnR9KGRhdGF8bmV3dHlwZSlcXHMre2RhdGFfZGVmfS9cbiAgICBlbmQ6IC97aW5kZW50QmxvY2tFbmR9L1xuICAgIGJlZ2luQ2FwdHVyZXM6XG4gICAgICAyOiBuYW1lOiAna2V5d29yZC5vdGhlci5kYXRhLmhhc2tlbGwnXG4gICAgICAzOlxuICAgICAgICBuYW1lOiAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJ1xuICAgICAgICBwYXR0ZXJuczogW1xuICAgICAgICAgIHtpbmNsdWRlOiAnI2ZhbWlseV9hbmRfaW5zdGFuY2UnfVxuICAgICAgICAgIHtpbmNsdWRlOiAnI3R5cGVfc2lnbmF0dXJlJ31cbiAgICAgICAgXVxuICAgIHBhdHRlcm5zOiBbXG4gICAgICB7aW5jbHVkZTogJyNjb21tZW50cyd9XG4gICAgICB7aW5jbHVkZTogJyNzdHJpbmcnfVxuICAgICAge2luY2x1ZGU6ICcjd2hlcmUnfVxuICAgICAge2luY2x1ZGU6ICcjZGVyaXZpbmcnfVxuICAgICAge2luY2x1ZGU6ICcjdmlhJ31cbiAgICAgIHtpbmNsdWRlOiAnI2Fzc2lnbm1lbnRfb3AnfVxuICAgICAge2luY2x1ZGU6ICcjdHlwZV9jdG9yX2ZvcmFsbCd9XG4gICAgICB7aW5jbHVkZTogJyN0eXBlX2N0b3JfYWx0J31cbiAgICAgIHtcbiAgICAgICAgbWF0Y2g6IC9cXHwvXG4gICAgICAgIGNhcHR1cmVzOlxuICAgICAgICAgIDA6IG5hbWU6ICdwdW5jdHVhdGlvbi5zZXBhcmF0b3IucGlwZS5oYXNrZWxsJ1xuICAgICAgfVxuICAgICAge1xuICAgICAgICBuYW1lOiAnbWV0YS5kZWNsYXJhdGlvbi50eXBlLmRhdGEucmVjb3JkLmJsb2NrLmhhc2tlbGwnXG4gICAgICAgIGJlZ2luOiAvXFx7L1xuICAgICAgICBiZWdpbkNhcHR1cmVzOlxuICAgICAgICAgIDA6IG5hbWU6ICdrZXl3b3JkLm9wZXJhdG9yLnJlY29yZC5iZWdpbi5oYXNrZWxsJ1xuICAgICAgICBlbmQ6IC9cXH0vXG4gICAgICAgIGVuZENhcHR1cmVzOlxuICAgICAgICAgIDA6IG5hbWU6ICdrZXl3b3JkLm9wZXJhdG9yLnJlY29yZC5lbmQuaGFza2VsbCdcbiAgICAgICAgcGF0dGVybnM6IFtcbiAgICAgICAgICAgIHtpbmNsdWRlOiAnI2NvbW1lbnRzJ31cbiAgICAgICAgICAgIHtpbmNsdWRlOiAnI2NvbW1hJ31cbiAgICAgICAgICAgIHtpbmNsdWRlOiAnI3JlY29yZF9maWVsZF9kZWNsYXJhdGlvbid9XG4gICAgICAgIF1cbiAgICAgIH1cbiAgICAgIHtpbmNsdWRlOiAnI2N0b3JfdHlwZV9kZWNsYXJhdGlvbid9ICNHQURUXG4gICAgXVxuICB0eXBlX2N0b3JfZm9yYWxsOlxuICAgIGJlZ2luOiAne2xifWZvcmFsbHtyYn0nXG4gICAgZW5kOiAne3R5cGVfY3Rvcl9hbHRfZGVsaW19J1xuICAgIGNvbnRlbnROYW1lOiAnbWV0YS50eXBlLXNpZ25hdHVyZSdcbiAgICBiZWdpbkNhcHR1cmVzOlxuICAgICAgMDogcGF0dGVybnM6IFtpbmNsdWRlOiAnI3R5cGVfc2lnbmF0dXJlJ11cbiAgICBwYXR0ZXJuczogW1xuICAgICAge2luY2x1ZGU6ICcjY29tbWVudHMnfVxuICAgICAge1xuICAgICAgICBtYXRjaDogJ1xcXFxHLio/e2JpZ19hcnJvd30nXG4gICAgICAgIGNhcHR1cmVzOiAwOiBwYXR0ZXJuczogW2luY2x1ZGU6ICcjdHlwZV9zaWduYXR1cmUnXVxuICAgICAgfVxuICAgICAge1xuICAgICAgICBtYXRjaDogJ1xcXFxHLio/XFxcXC4nXG4gICAgICAgIGNhcHR1cmVzOiAwOiBwYXR0ZXJuczogW2luY2x1ZGU6ICcjdHlwZV9zaWduYXR1cmUnXVxuICAgICAgfVxuICAgICAgeyBpbmNsdWRlOiAnI2JpZ19hcnJvdycgfVxuICAgICAgeyBpbmNsdWRlOiAnI3R5cGVfdmFyaWFibGUnIH1cbiAgICAgIHtcbiAgICAgICAgYmVnaW46ICdcXFxcKCdcbiAgICAgICAgZW5kOiAnXFxcXCknXG4gICAgICAgIHBhdHRlcm5zOiBbaW5jbHVkZTogJyN0eXBlX3NpZ25hdHVyZSddXG4gICAgICB9XG4gICAgICB7aW5jbHVkZTogJyN0eXBlX2N0b3JfYWx0J31cbiAgICBdXG4gIHR5cGVfY3Rvcl9hbHQ6XG4gICAgYmVnaW46ICd7bGJ9KHtjbGFzc05hbWV9KVxcXFxzKidcbiAgICBlbmQ6ICd7dHlwZV9jdG9yX2FsdF9kZWxpbX0nXG4gICAgY29udGVudE5hbWU6ICdtZXRhLnR5cGUtc2lnbmF0dXJlJ1xuICAgIGJlZ2luQ2FwdHVyZXM6XG4gICAgICAxOiBwYXR0ZXJuczogW2luY2x1ZGU6ICcjdHlwZV9jdG9yJ11cbiAgICBwYXR0ZXJuczogW1xuICAgICAge2luY2x1ZGU6ICcjY29tbWVudHMnfVxuICAgICAge2luY2x1ZGU6ICcjdHlwZV9zaWduYXR1cmUnfVxuICAgIF1cbiAgdHlwZV9hbGlhczpcbiAgICBuYW1lOiAnbWV0YS5kZWNsYXJhdGlvbi50eXBlLnR5cGUuaGFza2VsbCdcbiAgICBiZWdpbjogL3tpbmRlbnRCbG9ja1N0YXJ0fSh0eXBlKXtyYn0vXG4gICAgZW5kOiAve2luZGVudEJsb2NrRW5kfS9cbiAgICBjb250ZW50TmFtZTogJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCdcbiAgICBiZWdpbkNhcHR1cmVzOlxuICAgICAgMjogbmFtZTogJ2tleXdvcmQub3RoZXIudHlwZS5oYXNrZWxsJ1xuICAgIHBhdHRlcm5zOiBbXG4gICAgICAgIHtpbmNsdWRlOiAnI2NvbW1lbnRzJ31cbiAgICAgICAge2luY2x1ZGU6ICcjZmFtaWx5X2FuZF9pbnN0YW5jZSd9XG4gICAgICAgIHtpbmNsdWRlOiAnI3doZXJlJ31cbiAgICAgICAge2luY2x1ZGU6ICcjYXNzaWdubWVudF9vcCd9XG4gICAgICAgIHtpbmNsdWRlOiAnI3R5cGVfc2lnbmF0dXJlJ31cbiAgICBdXG4gIGtleXdvcmRzOiBbXG4gICAgbmFtZTogJ2tleXdvcmQub3RoZXIuJDEuaGFza2VsbCdcbiAgICBtYXRjaDogXCJ7bGJ9KCN7b3RoZXJLZXl3b3Jkcy5qb2luKCd8Jyl9KXtyYn1cIlxuICAsXG4gICAgbmFtZTogJ2tleXdvcmQub3BlcmF0b3IuJDEuaGFza2VsbCdcbiAgICBtYXRjaDogL3tsYn0oaW5maXhbbHJdPyl7cmJ9L1xuICAsXG4gICAgbmFtZTogJ2tleXdvcmQuY29udHJvbC4kMS5oYXNrZWxsJ1xuICAgIG1hdGNoOiBcIntsYn0oI3tjb250cm9sS2V5d29yZHMuam9pbignfCcpfSl7cmJ9XCJcbiAgXVxuICBjX3ByZXByb2Nlc3NvcjpcbiAgICBuYW1lOiAnbWV0YS5wcmVwcm9jZXNzb3IuYydcbiAgICBiZWdpbjogL3ttYXliZUJpcmRUcmFja30oPz0jKS9cbiAgICBlbmQ6ICcoPzwhXFxcXFxcXFwpKD89JCknXG4gICAgcGF0dGVybnM6IFtcbiAgICAgIHtcbiAgICAgICAgbWF0Y2g6ICdeI1xcXFxTKydcbiAgICAgICAgbmFtZTogJ2tleXdvcmQuY29udHJvbC5jJ1xuICAgICAgfVxuICAgIF1cbiAgc3RyaW5nOlxuICAgIG5hbWU6ICdzdHJpbmcucXVvdGVkLmRvdWJsZS5oYXNrZWxsJ1xuICAgIGJlZ2luOiAvXCIvXG4gICAgZW5kOiAvXCIvXG4gICAgYmVnaW5DYXB0dXJlczpcbiAgICAgIDA6IG5hbWU6ICdwdW5jdHVhdGlvbi5kZWZpbml0aW9uLnN0cmluZy5iZWdpbi5oYXNrZWxsJ1xuICAgIGVuZENhcHR1cmVzOlxuICAgICAgMDogbmFtZTogJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24uc3RyaW5nLmVuZC5oYXNrZWxsJ1xuICAgIHBhdHRlcm5zOiBbXG4gICAgICAgIGluY2x1ZGU6ICcjY2hhcmFjdGVycydcbiAgICAgICxcbiAgICAgICAgYmVnaW46IC9cXFxcXFxzL1xuICAgICAgICBlbmQ6IC9cXFxcL1xuICAgICAgICBiZWdpbkNhcHR1cmVzOlxuICAgICAgICAgIDA6IG5hbWU6ICdtYXJrdXAub3RoZXIuZXNjYXBlLm5ld2xpbmUuYmVnaW4uaGFza2VsbCdcbiAgICAgICAgZW5kQ2FwdHVyZXM6XG4gICAgICAgICAgMDogbmFtZTogJ21hcmt1cC5vdGhlci5lc2NhcGUubmV3bGluZS5lbmQuaGFza2VsbCdcbiAgICAgICAgcGF0dGVybnM6IFtcbiAgICAgICAgICAgIHtpbmNsdWRlOiAnI2ludmFsaWQnfVxuICAgICAgICBdXG4gICAgXVxuICBuZXdsaW5lX2VzY2FwZTpcbiAgICBuYW1lOiAnbWFya3VwLm90aGVyLmVzY2FwZS5uZXdsaW5lLmhhc2tlbGwnXG4gICAgbWF0Y2g6IC9cXFxcJC9cbiAgcXVvdGVkX2NoYXJhY3RlcjpcbiAgICBuYW1lOiAnc3RyaW5nLnF1b3RlZC5zaW5nbGUuaGFza2VsbCdcbiAgICBtYXRjaDogLygnKSh7Y2hhcmFjdGVyfSkoJykvXG4gICAgY2FwdHVyZXM6XG4gICAgICAxOiBuYW1lOiAncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5zdHJpbmcuYmVnaW4uaGFza2VsbCdcbiAgICAgIDI6XG4gICAgICAgIHBhdHRlcm5zOltcbiAgICAgICAgICBpbmNsdWRlOiAnI2NoYXJhY3RlcnMnXG4gICAgICAgIF1cbiAgICAgIDM6IG5hbWU6ICdwdW5jdHVhdGlvbi5kZWZpbml0aW9uLnN0cmluZy5lbmQuaGFza2VsbCdcbiAgc2NvcGVkX3R5cGU6IFtcbiAgICBtYXRjaDogXCJcXFxcKCgje2JhbGFuY2VkICdwYXJlbicsICdcXFxcKCcsICdcXFxcKSd9e2RvdWJsZUNvbG9uT3BlcmF0b3J9I3tiYWxhbmNlZCAncGFyZW4yJywgJ1xcXFwoJywgJ1xcXFwpJ30pXFxcXClcIlxuICAgIGNhcHR1cmVzOlxuICAgICAgMTogcGF0dGVybnM6IFtcbiAgICAgICAgaW5jbHVkZTogJyNoYXNrZWxsX2V4cHInXG4gICAgICBdXG4gICxcbiAgICBtYXRjaDogJyh7ZG91YmxlQ29sb25PcGVyYXRvcn0pJytcbiAgICAgICAgXCIoKD86KD8hey18I3tndWFyZGVkICc8LXw9fC0tKyd9fCQpLnx7LS4qPy19KSopXCJcbiAgICBjYXB0dXJlczpcbiAgICAgIDE6IG5hbWU6ICdrZXl3b3JkLm90aGVyLmRvdWJsZS1jb2xvbi5oYXNrZWxsJ1xuICAgICAgMjoge25hbWU6ICdtZXRhLnR5cGUtc2lnbmF0dXJlLmhhc2tlbGwnLCBwYXR0ZXJuczogW2luY2x1ZGU6ICcjdHlwZV9zaWduYXR1cmUnXX1cbiAgXVxuICBzY29wZWRfdHlwZV9vdmVycmlkZTpcbiAgICBtYXRjaDogJ3tpbmRlbnRCbG9ja1N0YXJ0fXtmdW5jdGlvblR5cGVEZWNsYXJhdGlvbn0nK1xuICAgICAgICBcIigoPzooPyF7LXwje2d1YXJkZWQgJy0tKyd9KS58ey0uKj8tfSkqKVwiK1xuICAgICAgICAnKHtzY29wZWRfYXNzaWdubWVudH0pJ1xuICAgIGNhcHR1cmVzOlxuICAgICAgMjogcGF0dGVybnM6IFtpbmNsdWRlOiAnI2lkZW50aWZpZXInXVxuICAgICAgMzogbmFtZTogJ2tleXdvcmQub3RoZXIuZG91YmxlLWNvbG9uLmhhc2tlbGwnXG4gICAgICA0OiB7bmFtZTogJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCcsIHBhdHRlcm5zOiBbaW5jbHVkZTogJyN0eXBlX3NpZ25hdHVyZSddfVxuICAgICAgNTogcGF0dGVybnM6IFtcbiAgICAgICAgICB7aW5jbHVkZTogJyNhc3NpZ25tZW50X29wJ31cbiAgICAgICAgICB7aW5jbHVkZTogJyNvcGVyYXRvcid9XG4gICAgICBdXG4gIGNvbW1hOlxuICAgIG5hbWU6ICdwdW5jdHVhdGlvbi5zZXBhcmF0b3IuY29tbWEuaGFza2VsbCdcbiAgICBtYXRjaDogLywvXG4gIGxpdF9udW06IFtcbiAgICBuYW1lOiAnY29uc3RhbnQubnVtZXJpYy5oZXhmbG9hdC5oYXNrZWxsJ1xuICAgIG1hdGNoOiBcIjBbeFhdI3tmbG9hdFBhdHRlcm4oJ1swLTlhLWZBLUZfXScsICdbcFBdJyl9XCJcbiAgLFxuICAgIG5hbWU6ICdjb25zdGFudC5udW1lcmljLmhleGFkZWNpbWFsLmhhc2tlbGwnXG4gICAgbWF0Y2g6ICcwW3hYXVtfMC05YS1mQS1GXSsnXG4gICxcbiAgICBuYW1lOiAnY29uc3RhbnQubnVtZXJpYy5vY3RhbC5oYXNrZWxsJ1xuICAgIG1hdGNoOiAnMFtvT11bXzAtN10rJ1xuICAsXG4gICAgbmFtZTogJ2NvbnN0YW50Lm51bWVyaWMuYmluYXJ5Lmhhc2tlbGwnXG4gICAgbWF0Y2g6ICcwW2JCXVtfMDFdKydcbiAgLFxuICAgIG5hbWU6ICdjb25zdGFudC5udW1lcmljLmZsb2F0Lmhhc2tlbGwnXG4gICAgbWF0Y2g6IFwiWzAtOV0je2Zsb2F0UGF0dGVybignWzAtOV9dJywgJ1tlRV0nKX1cIlxuICAsXG4gICAgbmFtZTogJ2NvbnN0YW50Lm51bWVyaWMuZGVjaW1hbC5oYXNrZWxsJ1xuICAgIG1hdGNoOiAnWzAtOV1bXzAtOV0qJ1xuICBdXG4gIG9wZXJhdG9yOlxuICAgIG5hbWU6ICdrZXl3b3JkLm9wZXJhdG9yLmhhc2tlbGwnXG4gICAgbWF0Y2g6IC97b3BlcmF0b3J9L1xuICAgIGNhcHR1cmVzOlxuICAgICAgMDogcGF0dGVybnM6IFtcbiAgICAgICAgeyBpbmNsdWRlOiAnI21vZHVsZV9uYW1lX3ByZWZpeCcgfVxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ3N1cHBvcnQub3BlcmF0b3IucHJlbHVkZS5oYXNrZWxsJ1xuICAgICAgICAgIG1hdGNoOiBcIl4oI3twcmVsdWRlLm9wZXJhdG9ycy5tYXAoKHgpIC0+IHgucmVwbGFjZSgvLi9nLCAoeSkgLT4gJ1xcXFwnK3kpKS5qb2luKCd8Jyl9KSRcIlxuICAgICAgICB9XG4gICAgICBdXG4gIGluZml4X29wOlxuICAgIG5hbWU6ICdlbnRpdHkubmFtZS5mdW5jdGlvbi5vcGVyYXRvci5oYXNrZWxsJ1xuICAgIG1hdGNoOiAve29wZXJhdG9yRnVufS9cbiAgICBjYXB0dXJlczpcbiAgICAgIDA6IHBhdHRlcm5zOiBbXG4gICAgICAgIHsgaW5jbHVkZTogJyNtb2R1bGVfbmFtZV9wcmVmaXgnIH1cbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdzdXBwb3J0Lm9wZXJhdG9yLnByZWx1ZGUuaGFza2VsbCdcbiAgICAgICAgICBtYXRjaDogXCJeXFxcXCgoI3twcmVsdWRlLm9wZXJhdG9ycy5tYXAoKHgpIC0+IHgucmVwbGFjZSgvLi9nLCAoeSkgLT4gJ1xcXFwnK3kpKS5qb2luKCd8Jyl9KVxcXFwpJFwiXG4gICAgICAgIH1cbiAgICAgIF1cbiAgaWRlbnRpZmllcjpcbiAgICBtYXRjaDogJ3tsYn17ZnVuY3Rpb25OYW1lfXtyYn0nXG4gICAgbmFtZTogJ2lkZW50aWZpZXIuaGFza2VsbCdcbiAgICBjYXB0dXJlczogMDogcGF0dGVybnM6IFtcbiAgICAgIHsgaW5jbHVkZTogJyNtb2R1bGVfbmFtZV9wcmVmaXgnIH1cbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ3N1cHBvcnQuZnVuY3Rpb24ucHJlbHVkZS4kMS5oYXNrZWxsJ1xuICAgICAgICBtYXRjaDogXCJ7bGJ9KCN7cHJlbHVkZS5mdW5jdC5qb2luKCd8Jyl9KXtyYn1cIlxuICAgICAgfVxuICAgIF1cbiAgdHlwZV9uYW1lOlxuICAgIG5hbWU6ICdlbnRpdHkubmFtZS50eXBlLmhhc2tlbGwnXG4gICAgbWF0Y2g6IC97bGJ9e2NsYXNzTmFtZX17cmJ9L1xuICAgIGNhcHR1cmVzOiAwOiBwYXR0ZXJuczogW1xuICAgICAgeyBpbmNsdWRlOiAnI21vZHVsZV9uYW1lX3ByZWZpeCcgfVxuICAgICAge1xuICAgICAgICAgIG5hbWU6ICdlbnRpdHkub3RoZXIuaW5oZXJpdGVkLWNsYXNzLnByZWx1ZGUuJDEuaGFza2VsbCdcbiAgICAgICAgICBtYXRjaDogXCJ7bGJ9KCN7cHJlbHVkZS5jbGFzc2VzLmpvaW4oJ3wnKX0pe3JifVwiXG4gICAgICB9XG4gICAgICB7XG4gICAgICAgICAgbmFtZTogJ3N1cHBvcnQuY2xhc3MucHJlbHVkZS4kMS5oYXNrZWxsJ1xuICAgICAgICAgIG1hdGNoOiBcIntsYn0oI3twcmVsdWRlLnR5cGVzLmpvaW4oJ3wnKX0pe3JifVwiXG4gICAgICB9XG4gICAgXVxuICB0eXBlX2N0b3I6XG4gICAgbmFtZTogJ2VudGl0eS5uYW1lLnRhZy5oYXNrZWxsJ1xuICAgIG1hdGNoOiAve2xifXtjbGFzc05hbWV9e3JifS9cbiAgICBjYXB0dXJlczogMDogcGF0dGVybnM6IFtcbiAgICAgIHsgaW5jbHVkZTogJyNtb2R1bGVfbmFtZV9wcmVmaXgnIH1cbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ3N1cHBvcnQudGFnLnByZWx1ZGUuJDEuaGFza2VsbCdcbiAgICAgICAgbWF0Y2g6IFwie2xifSgje3ByZWx1ZGUuY29uc3RyLmpvaW4oJ3wnKX0pe3JifVwiXG4gICAgICB9XG4gICAgXVxuICB3aGVyZTpcbiAgICBtYXRjaDogJ3tsYn13aGVyZXtyYn0nXG4gICAgbmFtZTogJ2tleXdvcmQub3RoZXIuaGFza2VsbCdcbiAgZmFtaWx5X2FuZF9pbnN0YW5jZTpcbiAgICBtYXRjaDogJ3tsYn0oZmFtaWx5fGluc3RhbmNlKXtyYn0nXG4gICAgbmFtZTogJ2tleXdvcmQub3RoZXIuaGFza2VsbCdcbiAgaW52YWxpZDpcbiAgICBtYXRjaDogL1xcUysvXG4gICAgbmFtZTogJ2ludmFsaWQuaWxsZWdhbC5jaGFyYWN0ZXItbm90LWFsbG93ZWQtaGVyZS5oYXNrZWxsJ1xuICBmdW5jdGlvbl9uYW1lOlxuICAgIG5hbWU6ICdlbnRpdHkubmFtZS5mdW5jdGlvbi5oYXNrZWxsJ1xuICAgIG1hdGNoOiAve2xifXtmdW5jdGlvbk5hbWV9e3JifS9cbiAgICBjYXB0dXJlczogMDogcGF0dGVybnM6IFtcbiAgICAgIHsgaW5jbHVkZTogJyNtb2R1bGVfbmFtZV9wcmVmaXgnIH1cbiAgICBdXG4gIGFzc2lnbm1lbnRfb3A6XG4gICAgbWF0Y2g6IC89L1xuICAgIGNhcHR1cmVzOlxuICAgICAgMDogbmFtZTogJ2tleXdvcmQub3BlcmF0b3IuYXNzaWdubWVudC5oYXNrZWxsJ1xuICBhdHRyaWJ1dGVfbmFtZTpcbiAgICBuYW1lOiAnZW50aXR5Lm90aGVyLmF0dHJpYnV0ZS1uYW1lLmhhc2tlbGwnXG4gICAgbWF0Y2g6IC97bGJ9e2Z1bmN0aW9uTmFtZX17cmJ9L1xuICBsaXF1aWRoYXNrZWxsX2Fubm90YXRpb246XG4gICAgbmFtZTogJ2Jsb2NrLmxpcXVpZGhhc2tlbGwnXG4gICAgY29udGVudE5hbWU6ICdibG9jay5saXF1aWRoYXNrZWxsLmFubm90YXRpb24nXG4gICAgYmVnaW46ICdcXFxcey1AKD8hIyknXG4gICAgZW5kOiAnQC1cXFxcfSdcbiAgICBwYXR0ZXJuczogW1xuICAgICAgeyBpbmNsdWRlOiAnYW5ub3RhdGlvbi5saXF1aWRoYXNrZWxsLmhhc2tlbGwnIH1cbiAgICBdXG4gIHR5cGVfYXBwbGljYXRpb246XG4gICAgbmFtZTogJ290aGVyLnR5cGUtYXBwbGljYXRpb24uaGFza2VsbCdcbiAgICBtYXRjaDogXCIoPD9cXFxccyspKEApKFxcXFwnP1xcXFwoI3tiYWxhbmNlZCAncGFyZW4nLCAnXFxcXCgnLCAnXFxcXCknfVxcXFwpfFxcXFwnP1xcXFxbI3tiYWxhbmNlZCAnYnJhY2snLCAnXFxcXFsnLCAnXFxcXF0nfVxcXFxdfFxcXCIje2JhbGFuY2VkICdxdW90JywgJ1wiJywgJ1wiJ31cXFwifCd7Y2hhcmFjdGVyfSd8XFxcXFMrKVwiXG4gICAgY2FwdHVyZXM6XG4gICAgICAyOiBwYXR0ZXJuczogW1xuICAgICAgICBpbmNsdWRlOiAnI29wZXJhdG9yJ1xuICAgICAgXVxuICAgICAgMzogcGF0dGVybnM6IFtcbiAgICAgICAgaW5jbHVkZTogJyN0eXBlX3NpZ25hdHVyZSdcbiAgICAgIF1cbiAgc2hlYmFuZzpcbiAgICBuYW1lOiAnY29tbWVudC5saW5lLnNoZWJhbmcuaGFza2VsbCdcbiAgICBtYXRjaDogJ15cXFxcI1xcXFwhLipcXFxcYnJ1bmhhc2tlbGxcXFxcYi4qJCdcbiAgaGFza2VsbF9leHByOiBbXG4gICAgeyBpbmNsdWRlOiAnI2luZml4X2Z1bmN0aW9uJyB9XG4gICAgeyBpbmNsdWRlOiAnI3VuaXQnIH1cbiAgICB7IGluY2x1ZGU6ICcjZW1wdHlfbGlzdCcgfVxuICAgIHsgaW5jbHVkZTogJyNxdWFzaV9xdW90ZXMnIH1cbiAgICB7IGluY2x1ZGU6ICcja2V5d29yZHMnIH1cbiAgICB7IGluY2x1ZGU6ICcjcHJhZ21hJyB9XG4gICAgeyBpbmNsdWRlOiAnI3N0cmluZycgfVxuICAgIHsgaW5jbHVkZTogJyNuZXdsaW5lX2VzY2FwZScgfVxuICAgIHsgaW5jbHVkZTogJyNxdW90ZWRfY2hhcmFjdGVyJyB9XG4gICAgeyBpbmNsdWRlOiAnI2NvbW1lbnRzJyB9XG4gICAgeyBpbmNsdWRlOiAnI2luZml4X29wJyB9XG4gICAgeyBpbmNsdWRlOiAnI2NvbW1hJyB9XG4gICAgeyBpbmNsdWRlOiAnI2xpdF9udW0nIH1cbiAgICB7IGluY2x1ZGU6ICcjc2NvcGVkX3R5cGUnIH1cbiAgICB7IGluY2x1ZGU6ICcjdHlwZV9hcHBsaWNhdGlvbicgfVxuICAgIHsgaW5jbHVkZTogJyNvcGVyYXRvcicgfVxuICAgIHsgaW5jbHVkZTogJyNpZGVudGlmaWVyJyB9XG4gICAgeyBpbmNsdWRlOiAnI3R5cGVfY3RvcicgfVxuICBdXG4gIGNvbW1vbl90b3BsZXZlbDogW1xuICAgIHsgaW5jbHVkZTogJyNjbGFzc19kZWNsJyB9XG4gICAgeyBpbmNsdWRlOiAnI2luc3RhbmNlX2RlY2wnIH1cbiAgICB7IGluY2x1ZGU6ICcjZGVyaXZpbmdfaW5zdGFuY2VfZGVjbCcgfVxuICAgIHsgaW5jbHVkZTogJyNmb3JlaWduX2ltcG9ydCcgfVxuICAgIHsgaW5jbHVkZTogJyNyZWd1bGFyX2ltcG9ydCcgfVxuICAgIHsgaW5jbHVkZTogJyNkYXRhX2RlY2wnIH1cbiAgICB7IGluY2x1ZGU6ICcjdHlwZV9hbGlhcycgfVxuICAgIHsgaW5jbHVkZTogJyNjX3ByZXByb2Nlc3NvcicgfVxuICBdXG4gIGZ1bmN0aW9uX3R5cGVfZGVjbGFyYXRpb25fd2l0aF9zY29wZWRfdHlwZTogW1xuICAgIHsgaW5jbHVkZTogJyNzY29wZWRfdHlwZV9vdmVycmlkZScgfVxuICAgIHsgaW5jbHVkZTogJyNmdW5jdGlvbl90eXBlX2RlY2xhcmF0aW9uJyB9XG4gICAgeyBpbmNsdWRlOiAnI211bHRpbGluZV90eXBlX2RlY2xhcmF0aW9uJyB9XG4gIF1cbiAgaGFza2VsbF90b3BsZXZlbDogW1xuICAgIHsgaW5jbHVkZTogJyNsaXF1aWRoYXNrZWxsX2Fubm90YXRpb24nIH1cbiAgICB7IGluY2x1ZGU6ICcjY29tbW9uX3RvcGxldmVsJyB9XG4gICAgeyBpbmNsdWRlOiAnI2Z1bmN0aW9uX3R5cGVfZGVjbGFyYXRpb25fd2l0aF9zY29wZWRfdHlwZScgfVxuICAgIHsgaW5jbHVkZTogJyNoYXNrZWxsX2V4cHInIH1cbiAgXVxuICBoc2lnX3RvcGxldmVsOiBbXG4gICAgeyBpbmNsdWRlOiAnI2NvbW1vbl90b3BsZXZlbCcgfVxuICAgIHsgaW5jbHVkZTogJyNmdW5jdGlvbl90eXBlX2RlY2xhcmF0aW9uJyB9XG4gICAgeyBpbmNsdWRlOiAnI2xhenlfZnVuY3Rpb25fdHlwZV9zaWduYXR1cmUnIH1cbiAgICB7IGluY2x1ZGU6ICcjY29tbWVudHMnIH1cbiAgXVxuICBoYXNrZWxsX3NvdXJjZTogW1xuICAgIHsgaW5jbHVkZTogJyNzaGViYW5nJyB9XG4gICAgeyBpbmNsdWRlOiAnI21vZHVsZV9kZWNsJyB9XG4gICAgeyBpbmNsdWRlOiAnI2hhc2tlbGxfdG9wbGV2ZWwnIH1cbiAgXVxuICBoc2lnX3NvdXJjZTogW1xuICAgIHsgaW5jbHVkZTogJyNoc2lnX2RlY2wnIH1cbiAgICB7IGluY2x1ZGU6ICcjaHNpZ190b3BsZXZlbCcgfVxuICBdXG4iXX0=
