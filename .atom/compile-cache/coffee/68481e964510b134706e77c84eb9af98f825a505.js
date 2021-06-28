(function() {
  var balanced, concat, guarded, list, listMaybe, ref;

  ref = require('./util'), list = ref.list, listMaybe = ref.listMaybe, concat = ref.concat, guarded = ref.guarded, balanced = ref.balanced;

  module.exports = {
    identStartCharClass: /[\p{Ll}_\p{Lu}\p{Lt}]/,
    identContCharClass: /[\p{Ll}_\p{Lu}\p{Lt}']/,
    identCharClass: /[\p{Ll}_\p{Lu}\p{Lt}\p{Nd}']/,
    functionNameOne: /[\p{Ll}_]{identCharClass}*/,
    classNameOne: /[\p{Lu}\p{Lt}]{identCharClass}*/,
    functionName: /(?:{className}\.)?{functionNameOne}/,
    className: /{classNameOne}(?:\.{classNameOne})*/,
    operatorChar: '(?:[\\p{S}\\p{P}](?<![(),;\\[\\]`{}_"\']))',

    /*
    In case this regex seems overly general, note that Haskell
    permits the definition of new operators which can be nearly any string
    of punctuation characters, such as $%^&*.
     */
    operator: /(?:{lb}{className}\.)?{operatorChar}+/,
    operatorFun: /(?:\((?!--+\)|\.\.\)){operator}\))/,
    basicChar: /[\ -\[\]-~]/,
    escapeChar: /\\(?:NUL|SOH|STX|ETX|EOT|ENQ|ACK|BEL|BS|HT|LF|VT|FF|CR|SO|SI|DLE|DC1|DC2|DC3|DC4|NAK|SYN|ETB|CAN|EM|SUB|ESC|FS|GS|RS|US|SP|DEL|[abfnrtv\\\"'\&])/,
    octalChar: /(?:\\o[0-7]+)/,
    hexChar: /(?:\\x[0-9A-Fa-f]+)/,
    controlChar: /(?:\\\^[A-Z@\[\]\\^_])/,
    character: '(?:{basicChar}|{escapeChar}|{octalChar}|{hexChar}|{controlChar}|{operatorChar})',
    functionList: list(/{functionName}|{operatorFun}/, /\s*,\s*/),
    functionTypeDeclaration: concat(/{functionList}\s*({doubleColonOperator})/),
    doubleColonOperator: guarded('::|∷'),
    ctorTypeDeclaration: concat(list(/{className}|{operatorFun}/, /\s*,\s*/), /\s*({doubleColonOperator})/),
    ctorArgs: /(?!deriving)(?:{className}|{functionName}|(?:(?!deriving)(?:[\w()'→⇒\[\],]|->|=>)+\s*)+)/,
    ctor: concat(/{lb}({className})\s*/, listMaybe(/{ctorArgs}/, /\s+/)),
    typeDeclOne: /(?:(?!{lb}where{rb})(?:{className}|{functionName}))/,
    typeDecl: '(?>(?:{typeDeclOne})(?:\\s+{typeDeclOne})*)',
    indentChar: /[ \t]/,
    indentBlockStart: '{maybeBirdTrack}({indentChar}*)',
    indentBlockEnd: /^(?!\1{indentChar}|{indentChar}*$)/,
    indentBlockCont: /^(?!\1|{indentChar}*$)/,
    maybeBirdTrack: /^/,
    lb: '(?:(?={identStartCharClass})(?<!{identContCharClass}))',
    lbrel: '(?:(?={identContCharClass})(?<!{identContCharClass}))',
    rb: '(?:(?<={identCharClass})(?!{identCharClass}))',
    b: '(?:{lb}|{rb})',
    data_def: "((?:(?!" + (guarded('=|--+')) + "|{lb}where{rb}|{-).|{-.*?-})*)",
    scoped_assignment: guarded('<-|='),
    deriving: '(?:(deriving)(?:\\s+({functionNameOne}))?)',
    arrow: guarded('->|→'),
    big_arrow: guarded('=>|⇒'),
    type_ctor_alt_delim: /^(?!{maybeBirdTrack}{indentChar}|{indentChar}*$)|(?=\{|\}|\||{lb}deriving{rb})/
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYXJjaC8uYXRvbS9wYWNrYWdlcy9sYW5ndWFnZS1oYXNrZWxsL3NyYy9pbmNsdWRlL21hY3Jvcy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQStDLE9BQUEsQ0FBUSxRQUFSLENBQS9DLEVBQUMsZUFBRCxFQUFPLHlCQUFQLEVBQWtCLG1CQUFsQixFQUEwQixxQkFBMUIsRUFBbUM7O0VBRW5DLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxtQkFBQSxFQUFxQix1QkFBckI7SUFDQSxrQkFBQSxFQUFvQix3QkFEcEI7SUFFQSxjQUFBLEVBQWdCLDhCQUZoQjtJQUdBLGVBQUEsRUFBaUIsNEJBSGpCO0lBSUEsWUFBQSxFQUFjLGlDQUpkO0lBS0EsWUFBQSxFQUFjLHFDQUxkO0lBTUEsU0FBQSxFQUFXLHFDQU5YO0lBT0EsWUFBQSxFQUFjLDRDQVBkOztBQVFBOzs7OztJQUtBLFFBQUEsRUFBVSx1Q0FiVjtJQWNBLFdBQUEsRUFBYSxvQ0FkYjtJQXNCQSxTQUFBLEVBQVcsYUF0Qlg7SUF1QkEsVUFBQSxFQUFZLGtKQXZCWjtJQTRCQSxTQUFBLEVBQVcsZUE1Qlg7SUE2QkEsT0FBQSxFQUFTLHFCQTdCVDtJQThCQSxXQUFBLEVBQWEsd0JBOUJiO0lBK0JBLFNBQUEsRUFBVyxpRkEvQlg7SUFnQ0EsWUFBQSxFQUFjLElBQUEsQ0FBSyw4QkFBTCxFQUFxQyxTQUFyQyxDQWhDZDtJQWlDQSx1QkFBQSxFQUNFLE1BQUEsQ0FBTywwQ0FBUCxDQWxDRjtJQW1DQSxtQkFBQSxFQUFzQixPQUFBLENBQVEsTUFBUixDQW5DdEI7SUFvQ0EsbUJBQUEsRUFDRSxNQUFBLENBQU8sSUFBQSxDQUFLLDJCQUFMLEVBQWtDLFNBQWxDLENBQVAsRUFDRSw0QkFERixDQXJDRjtJQXVDQSxRQUFBLEVBQVUsMEZBdkNWO0lBK0NBLElBQUEsRUFBTSxNQUFBLENBQU8sc0JBQVAsRUFBK0IsU0FBQSxDQUFVLFlBQVYsRUFBd0IsS0FBeEIsQ0FBL0IsQ0EvQ047SUFnREEsV0FBQSxFQUFhLHFEQWhEYjtJQWlEQSxRQUFBLEVBQVUsNkNBakRWO0lBa0RBLFVBQUEsRUFBWSxPQWxEWjtJQW1EQSxnQkFBQSxFQUFrQixpQ0FuRGxCO0lBb0RBLGNBQUEsRUFBZ0Isb0NBcERoQjtJQXFEQSxlQUFBLEVBQWlCLHdCQXJEakI7SUFzREEsY0FBQSxFQUFnQixHQXREaEI7SUF1REEsRUFBQSxFQUFJLHdEQXZESjtJQXdEQSxLQUFBLEVBQU8sdURBeERQO0lBeURBLEVBQUEsRUFBSSwrQ0F6REo7SUEwREEsQ0FBQSxFQUFHLGVBMURIO0lBMkRBLFFBQUEsRUFBVSxTQUFBLEdBQVMsQ0FBQyxPQUFBLENBQVEsT0FBUixDQUFELENBQVQsR0FBMEIsZ0NBM0RwQztJQTREQSxpQkFBQSxFQUFtQixPQUFBLENBQVEsTUFBUixDQTVEbkI7SUE2REEsUUFBQSxFQUFVLDRDQTdEVjtJQThEQSxLQUFBLEVBQU8sT0FBQSxDQUFRLE1BQVIsQ0E5RFA7SUErREEsU0FBQSxFQUFXLE9BQUEsQ0FBUSxNQUFSLENBL0RYO0lBZ0VBLG1CQUFBLEVBQXFCLGdGQWhFckI7O0FBSEYiLCJzb3VyY2VzQ29udGVudCI6WyJ7bGlzdCwgbGlzdE1heWJlLCBjb25jYXQsIGd1YXJkZWQsIGJhbGFuY2VkfSA9IHJlcXVpcmUgJy4vdXRpbCdcblxubW9kdWxlLmV4cG9ydHM9XG4gIGlkZW50U3RhcnRDaGFyQ2xhc3M6IC9bXFxwe0xsfV9cXHB7THV9XFxwe0x0fV0vXG4gIGlkZW50Q29udENoYXJDbGFzczogL1tcXHB7TGx9X1xccHtMdX1cXHB7THR9J10vXG4gIGlkZW50Q2hhckNsYXNzOiAvW1xccHtMbH1fXFxwe0x1fVxccHtMdH1cXHB7TmR9J10vXG4gIGZ1bmN0aW9uTmFtZU9uZTogL1tcXHB7TGx9X117aWRlbnRDaGFyQ2xhc3N9Ki9cbiAgY2xhc3NOYW1lT25lOiAvW1xccHtMdX1cXHB7THR9XXtpZGVudENoYXJDbGFzc30qL1xuICBmdW5jdGlvbk5hbWU6IC8oPzp7Y2xhc3NOYW1lfVxcLik/e2Z1bmN0aW9uTmFtZU9uZX0vXG4gIGNsYXNzTmFtZTogL3tjbGFzc05hbWVPbmV9KD86XFwue2NsYXNzTmFtZU9uZX0pKi9cbiAgb3BlcmF0b3JDaGFyOiAnKD86W1xcXFxwe1N9XFxcXHB7UH1dKD88IVsoKSw7XFxcXFtcXFxcXWB7fV9cIlxcJ10pKSdcbiAgIyMjXG4gIEluIGNhc2UgdGhpcyByZWdleCBzZWVtcyBvdmVybHkgZ2VuZXJhbCwgbm90ZSB0aGF0IEhhc2tlbGxcbiAgcGVybWl0cyB0aGUgZGVmaW5pdGlvbiBvZiBuZXcgb3BlcmF0b3JzIHdoaWNoIGNhbiBiZSBuZWFybHkgYW55IHN0cmluZ1xuICBvZiBwdW5jdHVhdGlvbiBjaGFyYWN0ZXJzLCBzdWNoIGFzICQlXiYqLlxuICAjIyNcbiAgb3BlcmF0b3I6IC8oPzp7bGJ9e2NsYXNzTmFtZX1cXC4pP3tvcGVyYXRvckNoYXJ9Ky9cbiAgb3BlcmF0b3JGdW46IC8vL1xuICAgICg/OlxuICAgICAgXFwoXG4gICAgICAgICg/IS0tK1xcKXxcXC5cXC5cXCkpICMgQW4gb3BlcmF0b3IgY2Fubm90IGJlIGNvbXBvc2VkIGVudGlyZWx5IG9mIGAtYCBjaGFyYWN0ZXJzLCBvciAuLlxuICAgICAgICB7b3BlcmF0b3J9XG4gICAgICBcXClcbiAgICApXG4gICAgLy8vXG4gIGJhc2ljQ2hhcjogL1tcXCAtXFxbXFxdLX5dL1xuICBlc2NhcGVDaGFyOiAvLy9cbiAgICBcXFxcKD86TlVMfFNPSHxTVFh8RVRYfEVPVHxFTlF8QUNLfEJFTHxCU3xIVHxMRnxWVHxGRnxDUnxTT3xTSXxETEVcbiAgICAgIHxEQzF8REMyfERDM3xEQzR8TkFLfFNZTnxFVEJ8Q0FOfEVNfFNVQnxFU0N8RlN8R1N8UlNcbiAgICAgIHxVU3xTUHxERUx8W2FiZm5ydHZcXFxcXFxcIidcXCZdKSAgICAjIEVzY2FwZXNcbiAgICAvLy9cbiAgb2N0YWxDaGFyOiAvKD86XFxcXG9bMC03XSspL1xuICBoZXhDaGFyOiAvKD86XFxcXHhbMC05QS1GYS1mXSspL1xuICBjb250cm9sQ2hhcjogLyg/OlxcXFxcXF5bQS1aQFxcW1xcXVxcXFxeX10pL1xuICBjaGFyYWN0ZXI6ICcoPzp7YmFzaWNDaGFyfXx7ZXNjYXBlQ2hhcn18e29jdGFsQ2hhcn18e2hleENoYXJ9fHtjb250cm9sQ2hhcn18e29wZXJhdG9yQ2hhcn0pJ1xuICBmdW5jdGlvbkxpc3Q6IGxpc3QoL3tmdW5jdGlvbk5hbWV9fHtvcGVyYXRvckZ1bn0vLCAvXFxzKixcXHMqLylcbiAgZnVuY3Rpb25UeXBlRGVjbGFyYXRpb246XG4gICAgY29uY2F0IC97ZnVuY3Rpb25MaXN0fVxccyooe2RvdWJsZUNvbG9uT3BlcmF0b3J9KS9cbiAgZG91YmxlQ29sb25PcGVyYXRvcjogIGd1YXJkZWQgJzo6fOKItydcbiAgY3RvclR5cGVEZWNsYXJhdGlvbjpcbiAgICBjb25jYXQgbGlzdCgve2NsYXNzTmFtZX18e29wZXJhdG9yRnVufS8sIC9cXHMqLFxccyovKSxcbiAgICAgIC9cXHMqKHtkb3VibGVDb2xvbk9wZXJhdG9yfSkvXG4gIGN0b3JBcmdzOiAvLy9cbiAgICAoPyFkZXJpdmluZylcbiAgICAoPzpcbiAgICB7Y2xhc3NOYW1lfSAgICAgI3Byb3BlciB0eXBlXG4gICAgfHtmdW5jdGlvbk5hbWV9ICN0eXBlIHZhcmlhYmxlXG4gICAgfCg/Oig/IWRlcml2aW5nKSg/OltcXHcoKSfihpLih5JcXFtcXF0sXXwtPnw9PikrXFxzKikrICNhbnl0aGluZyBnb2VzIVxuICAgIClcbiAgICAvLy9cbiAgY3RvcjogY29uY2F0IC97bGJ9KHtjbGFzc05hbWV9KVxccyovLCBsaXN0TWF5YmUoL3tjdG9yQXJnc30vLCAvXFxzKy8pXG4gIHR5cGVEZWNsT25lOiAvKD86KD8he2xifXdoZXJle3JifSkoPzp7Y2xhc3NOYW1lfXx7ZnVuY3Rpb25OYW1lfSkpL1xuICB0eXBlRGVjbDogJyg/Pig/Ont0eXBlRGVjbE9uZX0pKD86XFxcXHMre3R5cGVEZWNsT25lfSkqKSdcbiAgaW5kZW50Q2hhcjogL1sgXFx0XS9cbiAgaW5kZW50QmxvY2tTdGFydDogJ3ttYXliZUJpcmRUcmFja30oe2luZGVudENoYXJ9KiknXG4gIGluZGVudEJsb2NrRW5kOiAvXig/IVxcMXtpbmRlbnRDaGFyfXx7aW5kZW50Q2hhcn0qJCkvXG4gIGluZGVudEJsb2NrQ29udDogL14oPyFcXDF8e2luZGVudENoYXJ9KiQpL1xuICBtYXliZUJpcmRUcmFjazogL14vXG4gIGxiOiAnKD86KD89e2lkZW50U3RhcnRDaGFyQ2xhc3N9KSg/PCF7aWRlbnRDb250Q2hhckNsYXNzfSkpJ1xuICBsYnJlbDogJyg/Oig/PXtpZGVudENvbnRDaGFyQ2xhc3N9KSg/PCF7aWRlbnRDb250Q2hhckNsYXNzfSkpJ1xuICByYjogJyg/Oig/PD17aWRlbnRDaGFyQ2xhc3N9KSg/IXtpZGVudENoYXJDbGFzc30pKSdcbiAgYjogJyg/OntsYn18e3JifSknXG4gIGRhdGFfZGVmOiBcIigoPzooPyEje2d1YXJkZWQgJz18LS0rJ318e2xifXdoZXJle3JifXx7LSkufHstLio/LX0pKilcIlxuICBzY29wZWRfYXNzaWdubWVudDogZ3VhcmRlZCAnPC18PSdcbiAgZGVyaXZpbmc6ICcoPzooZGVyaXZpbmcpKD86XFxcXHMrKHtmdW5jdGlvbk5hbWVPbmV9KSk/KSdcbiAgYXJyb3c6IGd1YXJkZWQgJy0+fOKGkidcbiAgYmlnX2Fycm93OiBndWFyZGVkICc9Pnzih5InXG4gIHR5cGVfY3Rvcl9hbHRfZGVsaW06IC9eKD8he21heWJlQmlyZFRyYWNrfXtpbmRlbnRDaGFyfXx7aW5kZW50Q2hhcn0qJCl8KD89XFx7fFxcfXxcXHx8e2xifWRlcml2aW5ne3JifSkvXG4iXX0=
