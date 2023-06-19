!(function (e, t) {
  "object" == typeof exports && "object" == typeof module
    ? (module.exports = t())
    : "function" == typeof define && define.amd
    ? define([], t)
    : "object" == typeof exports
    ? (exports.MonacoBlock = t())
    : (e.MonacoBlock = t());
})(window, () =>
  (() => {
    "use strict";
    var e = {
        d: (t, n) => {
          for (var o in n)
            e.o(n, o) &&
              !e.o(t, o) &&
              Object.defineProperty(t, o, { enumerable: !0, get: n[o] });
        },
        o: (e, t) => Object.prototype.hasOwnProperty.call(e, t),
        r: (e) => {
          "undefined" != typeof Symbol &&
            Symbol.toStringTag &&
            Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
            Object.defineProperty(e, "__esModule", { value: !0 });
        },
      },
      t = {};
    function n(e) {
      return (
        (n =
          "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
            ? function (e) {
                return typeof e;
              }
            : function (e) {
                return e &&
                  "function" == typeof Symbol &&
                  e.constructor === Symbol &&
                  e !== Symbol.prototype
                  ? "symbol"
                  : typeof e;
              }),
        n(e)
      );
    }
    function o(e, t, n) {
      return (
        (o = (function () {
          if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
          if (Reflect.construct.sham) return !1;
          if ("function" == typeof Proxy) return !0;
          try {
            return (
              Boolean.prototype.valueOf.call(
                Reflect.construct(Boolean, [], function () {})
              ),
              !0
            );
          } catch (e) {
            return !1;
          }
        })()
          ? Reflect.construct.bind()
          : function (e, t, n) {
              var o = [null];
              o.push.apply(o, t);
              var r = new (Function.bind.apply(e, o))();
              return n && i(r, n.prototype), r;
            }),
        o.apply(null, arguments)
      );
    }
    function i(e, t) {
      return (
        (i = Object.setPrototypeOf
          ? Object.setPrototypeOf.bind()
          : function (e, t) {
              return (e.__proto__ = t), e;
            }),
        i(e, t)
      );
    }
    function r(e, t) {
      (null == t || t > e.length) && (t = e.length);
      for (var n = 0, o = new Array(t); n < t; n++) o[n] = e[n];
      return o;
    }
    function l(e, t) {
      for (var n = 0; n < t.length; n++) {
        var o = t[n];
        (o.enumerable = o.enumerable || !1),
          (o.configurable = !0),
          "value" in o && (o.writable = !0),
          Object.defineProperty(e, a(o.key), o);
      }
    }
    function s(e, t, n) {
      return (
        (t = a(t)) in e
          ? Object.defineProperty(e, t, {
              value: n,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (e[t] = n),
        e
      );
    }
    function a(e) {
      var t = (function (e, t) {
        if ("object" !== n(e) || null === e) return e;
        var o = e[Symbol.toPrimitive];
        if (void 0 !== o) {
          var i = o.call(e, "string");
          if ("object" !== n(i)) return i;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return String(e);
      })(e);
      return "symbol" === n(t) ? t : String(t);
    }
    e.r(t), e.d(t, { default: () => u });
    var u = (function () {
      function e(t, n) {
        !(function (e, t) {
          if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function");
        })(this, e),
          s(this, "decorationsCollection", null),
          s(this, "firstSelection", null),
          s(this, "isMac", /macintosh|mac os x/i.test(navigator.userAgent)),
          (this.editor = t),
          (this.monaco = n),
          (this.selectionBlock = {}),
          this.init();
      }
      var t, n;
      return (
        (t = e),
        (n = [
          {
            key: "init",
            value: function () {
              var e = this,
                t = this;
              this.editor.onDidChangeModelContent(
                (function () {
                  var e =
                      arguments.length > 0 && void 0 !== arguments[0]
                        ? arguments[0]
                        : 50,
                    n = null;
                  return function () {
                    n && clearTimeout(n),
                      (n = setTimeout(function () {
                        if (Object.keys(t.selectionBlock).length) {
                          for (
                            var e = t.decorationsCollection.getRanges(),
                              o = [],
                              i = 0,
                              r = e.length;
                            i < r;
                            i++
                          )
                            if (!t.selectionBlock.index.includes(i)) {
                              var l = e[i];
                              o.push({
                                range: new monaco.Range(
                                  l.startLineNumber,
                                  l.startColumn,
                                  l.endLineNumber,
                                  l.endColumn
                                ),
                                options: t.handleDecorationOption(
                                  "editor-custom-block"
                                ),
                              });
                            }
                          (t.selectionBlock = {}),
                            t.decorationsCollection.set(o);
                        }
                        n = null;
                      }, e));
                  };
                })()
              ),
                this.editor.onDidChangeCursorSelection(
                  this.handleChangeCursorSelection.bind(this)
                ),
                this.editor.onMouseDown(function () {
                  setTimeout(function () {
                    e.firstSelection = e.editor.getPosition();
                  }, 50);
                }),
                this.editor.onMouseUp(function () {
                  setTimeout(function () {
                    e.firstSelection = null;
                    var t = e.editor.getSelection();
                    e.selectionBlock = e.handkeIsIndecorationRange(
                      t,
                      !0,
                      !0,
                      !0
                    );
                  }, 50);
                }),
                this.editor.addCommand(
                  this.monaco.KeyCode.Backspace,
                  function () {
                    e.handleResetBackspace.bind(e)();
                  }
                ),
                this.editor.addCommand(this.monaco.KeyCode.Delete, function () {
                  e.handleResetBackspace.bind(e)(!0);
                }),
                this.editor.onKeyDown(function (t) {
                  var n = t.metaKey,
                    o = t.ctrlKey,
                    i = t.keyCode;
                  !(e.isMac ? n : o) ||
                    (56 !== i && 52 !== i && 55 !== i) ||
                    setTimeout(function () {
                      e.handleParseZero2decoration();
                    }, 50);
                }),
                this.handleParseZero2decoration();
            },
          },
          {
            key: "handleResetBackspace",
            value: function () {
              var e =
                  arguments.length > 0 &&
                  void 0 !== arguments[0] &&
                  arguments[0],
                t = this.editor.getPosition(),
                n = t.lineNumber,
                o = t.column,
                i = this.editor.getSelection(),
                r = i.endColumn,
                l = i.endLineNumber,
                s = i.startColumn,
                a = i.startLineNumber,
                u = {},
                c = !1;
              if (
                ((u =
                  a === l && s === r
                    ? this.handkeIsIndecorationRange(i, e, !0)
                    : this.handkeIsIndecorationRange(i, !1, !0, !0)),
                0 === Object.keys(u).length
                  ? (u = e
                      ? {
                          lineNumbers: [a, l],
                          columns: [s, r === s ? r + 1 : r],
                        }
                      : {
                          lineNumbers: [a, l],
                          columns: [s === r ? s - 1 : s, r],
                        })
                  : (c = !0),
                this.editor.executeEdits("", [
                  {
                    range: new monaco.Range(
                      u.lineNumbers[0],
                      u.columns[0],
                      u.lineNumbers[1],
                      u.columns[1]
                    ),
                    text: "",
                    forceMoveMarkers: !0,
                  },
                ]),
                c)
              ) {
                for (
                  var d = this.decorationsCollection.getRanges(),
                    m = [],
                    f = 0,
                    h = d.length;
                  f < h;
                  f++
                )
                  if (!u.index.includes(f)) {
                    var b = d[f];
                    m.push({
                      range: new monaco.Range(
                        b.startLineNumber,
                        b.startColumn,
                        b.endLineNumber,
                        b.endColumn
                      ),
                      options: this.handleDecorationOption(
                        "editor-custom-block"
                      ),
                    });
                  }
                this.decorationsCollection.set(m);
              }
              if (1 === o && 1 !== n) {
                var g = this.editor.getModel().getLineMaxColumn(n) - 1;
                this.editor.executeEdits("", [
                  {
                    range: new monaco.Range(
                      n - 1,
                      this.editor.getModel().getLineMaxColumn(n - 1),
                      n,
                      0
                    ),
                    text: "",
                    forceMoveMarkers: !0,
                  },
                ]),
                  this.editor.setPosition({
                    lineNumber: n - 1,
                    column: this.editor.getModel().getLineMaxColumn(n - 1) - g,
                  });
              }
            },
          },
          {
            key: "handleChangeCursorSelection",
            value: function (e) {
              var t,
                n,
                o = e.selection,
                i = e.source,
                l = e.oldSelections;
              if (
                this.decorationsCollection &&
                ["mouse", "keyboard"].includes(i)
              ) {
                var s = !this.firstSelection,
                  a = {};
                if (((a = this.handkeIsIndecorationRange(o)), s)) {
                  if (Object.keys(a).length) {
                    var u =
                        ((t = a.columns),
                        (n = 2),
                        (function (e) {
                          if (Array.isArray(e)) return e;
                        })(t) ||
                          (function (e, t) {
                            var n =
                              null == e
                                ? null
                                : ("undefined" != typeof Symbol &&
                                    e[Symbol.iterator]) ||
                                  e["@@iterator"];
                            if (null != n) {
                              var o,
                                i,
                                r,
                                l,
                                s = [],
                                a = !0,
                                u = !1;
                              try {
                                if (((r = (n = n.call(e)).next), 0 === t)) {
                                  if (Object(n) !== n) return;
                                  a = !1;
                                } else
                                  for (
                                    ;
                                    !(a = (o = r.call(n)).done) &&
                                    (s.push(o.value), s.length !== t);
                                    a = !0
                                  );
                              } catch (e) {
                                (u = !0), (i = e);
                              } finally {
                                try {
                                  if (
                                    !a &&
                                    null != n.return &&
                                    ((l = n.return()), Object(l) !== l)
                                  )
                                    return;
                                } finally {
                                  if (u) throw i;
                                }
                              }
                              return s;
                            }
                          })(t, n) ||
                          (function (e, t) {
                            if (e) {
                              if ("string" == typeof e) return r(e, t);
                              var n = Object.prototype.toString
                                .call(e)
                                .slice(8, -1);
                              return (
                                "Object" === n &&
                                  e.constructor &&
                                  (n = e.constructor.name),
                                "Map" === n || "Set" === n
                                  ? Array.from(e)
                                  : "Arguments" === n ||
                                    /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(
                                      n
                                    )
                                  ? r(e, t)
                                  : void 0
                              );
                            }
                          })(t, n) ||
                          (function () {
                            throw new TypeError(
                              "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
                            );
                          })()),
                      c = u[0],
                      d = u[1],
                      m = this.editor.getPosition(),
                      f = m.column,
                      h = m.lineNumber;
                    if ("mouse" === i) {
                      var b = {
                        lineNumber: h,
                        column: (c + d) / 2 > f ? c : d,
                      };
                      this.editor.setPosition(b);
                    } else {
                      var g = {
                        lineNumber: h,
                        column:
                          "toRight" ==
                          (o.endColumn > l[0].endColumn ? "toRight" : "toLeft")
                            ? d
                            : c,
                      };
                      this.editor.setPosition(g);
                    }
                  }
                } else {
                  var p = o.positionLineNumber,
                    y = o.positionColumn,
                    v = this.firstSelection,
                    C = v.lineNumber,
                    k = v.column;
                  Object.keys(a).length ||
                    (a = { columns: [o.positionColumn, o.positionColumn] }),
                    p > C || (p === C && y > k)
                      ? this.editor.setSelection({
                          endColumn: a.columns[1],
                          endLineNumber: p,
                          startColumn: this.firstSelection.column,
                          startLineNumber: this.firstSelection.lineNumber,
                        })
                      : this.editor.setSelection({
                          endColumn: k,
                          endLineNumber: C,
                          startColumn: a.columns[0],
                          startLineNumber: p,
                        });
                }
                this.prevPosition = o;
              }
            },
          },
          {
            key: "handkeIsIndecorationRange",
            value: function (e) {
              var t =
                  arguments.length > 1 &&
                  void 0 !== arguments[1] &&
                  arguments[1],
                n =
                  arguments.length > 2 &&
                  void 0 !== arguments[2] &&
                  arguments[2],
                o =
                  arguments.length > 3 &&
                  void 0 !== arguments[3] &&
                  arguments[3];
              if (this.decorationsCollection) {
                for (
                  var i = this.decorationsCollection.getRanges(), r = 0, l = {};
                  r < i.length;

                ) {
                  var s = i[r],
                    a = s.startLineNumber,
                    u = s.startColumn + +!t,
                    c = s.endColumn + +n;
                  if (o) {
                    var d = e.endColumn,
                      m = e.endLineNumber,
                      f = e.startColumn,
                      h = e.startLineNumber,
                      b = s.endColumn,
                      g = s.endLineNumber,
                      p = s.startColumn;
                    h <= s.startLineNumber &&
                      m >= g &&
                      f <= p &&
                      d >= b &&
                      (l.index
                        ? l.index.push(r)
                        : (l = {
                            lineNumbers: [h, m],
                            columns: [f, d],
                            index: [r],
                          })),
                      r++;
                  } else {
                    if (
                      a === e.positionLineNumber &&
                      e.positionColumn >= u &&
                      e.positionColumn < c
                    )
                      return {
                        lineNumbers: [a, a],
                        columns: [s.startColumn, s.endColumn],
                        index: [r],
                      };
                    r++;
                  }
                }
                return l;
              }
              return {};
            },
          },
          {
            key: "handleParseZero2decoration",
            value: function () {
              var e = this.editor
                .getModel()
                .findMatches(/\u200b [^ \u200b]+ \u200b/, !1, !0);
              if (e.length)
                for (var t = [], n = 0; n < e.length; n++)
                  t.push({
                    range: e[n].range,
                    options: this.handleDecorationOption("editor-custom-block"),
                  }),
                    (this.decorationsCollection =
                      this.editor.createDecorationsCollection(t));
            },
          },
          {
            key: "handleDecorationOption",
            value: function (e) {
              return {
                inlineClassName: e,
                stickiness:
                  monaco.editor.TrackedRangeStickiness
                    .NeverGrowsWhenTypingAtEdges,
              };
            },
          },
          {
            key: "addCode",
            value: function (e) {
              var t = this,
                n =
                  arguments.length > 1 && void 0 !== arguments[1]
                    ? arguments[1]
                    : "focus";
              if ("string" == typeof e) {
                if (this.editor) {
                  var i = null;
                  if ("focus" === n) {
                    var r = this.editor.getSelection();
                    i = new monaco.Range(
                      r.startLineNumber,
                      r.startColumn,
                      r.endLineNumber,
                      r.endColumn
                    );
                  } else {
                    var l = this.editor.getModel().getLineCount();
                    i = new monaco.Range(l + 1, 1, l + 1, 1);
                  }
                  var s = { range: i, text: e, forceMoveMarkers: !0 },
                    a = "editor-custom-block";
                  s.text = "​ ".concat(s.text, " ​");
                  var u = [
                    i.startLineNumber,
                    i.startColumn,
                    i.startLineNumber,
                    i.startColumn + s.text.length,
                  ];
                  if (this.decorationsCollection) {
                    var c = this.decorationsCollection
                      .getRanges()
                      .map(function (e, n) {
                        return {
                          range: new monaco.Range(
                            e.startLineNumber,
                            e.startColumn,
                            e.endLineNumber,
                            e.endColumn
                          ),
                          options: t.handleDecorationOption(a),
                        };
                      });
                    c.push({
                      range: o(monaco.Range, u),
                      options: this.handleDecorationOption(a),
                    }),
                      this.editor.executeEdits("", [s]),
                      this.decorationsCollection.set(c);
                  } else
                    this.editor.executeEdits("", [s]),
                      (this.decorationsCollection =
                        this.editor.createDecorationsCollection([
                          {
                            range: o(monaco.Range, u),
                            options: this.handleDecorationOption(a),
                          },
                        ]));
                  this.editor.focus();
                }
              } else alert("插入内容须为字符串");
            },
          },
          {
            key: "getAllBlockMessage",
            value: function () {
              return (
                this.handleParseZero2decoration(),
                this.decorationsCollection.getRanges()
              );
            },
          },
          {
            key: "hiddenZeroTip",
            value: function () {
              this.editor.updateOptions({
                unicodeHighlight: { invisibleCharacters: !1 },
              });
            },
          },
        ]),
        n && l(t.prototype, n),
        Object.defineProperty(t, "prototype", { writable: !1 }),
        e
      );
    })();
    return t.default;
  })()
);
