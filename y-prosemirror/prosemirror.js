(function () {
  'use strict';

  /**
   * @module math
   */
  const floor = Math.floor;

  /**
   * @function
   * @param {number} a
   * @param {number} b
   * @return {number} The smaller element of a and b
   */
  const min = (a, b) => a < b ? a : b;

  /**
   * @function
   * @param {number} a
   * @param {number} b
   * @return {number} The bigger element of a and b
   */
  const max = (a, b) => a > b ? a : b;

  const create = () => new Map();

  /**
   * Get map property. Create T if property is undefined and set T on map.
   *
   * @example
   *   const listeners = map.setIfUndefined(events, 'eventName', set.create)
   *   listeners.add(listener)
   *
   * @template T,K
   * @param {Map<K, T>} map
   * @param {K} key
   * @param {function():T} createT
   * @return {T}
   */
  const setIfUndefined = (map, key, createT) => {
    let set = map.get(key);
    if (set === undefined) {
      map.set(key, set = createT());
    }
    return set
  };

  /**
   * @template K
   * @template V
   * @param {Map<K,V>} m
   * @param {function(V,K):boolean} f
   * @return {boolean}
   */
  const any = (m, f) => {
    for (const [key, value] of m) {
      if (f(value, key)) {
        return true
      }
    }
    return false
  };

  /**
   * @module string
   */

  const fromCharCode = String.fromCharCode;

  /**
   * @param {string} s
   * @return {string}
   */
  const toLowerCase = s => s.toLowerCase();

  const trimLeftRegex = /^\s*/g;

  /**
   * @param {string} s
   * @return {string}
   */
  const trimLeft = s => s.replace(trimLeftRegex, '');

  const fromCamelCaseRegex = /([A-Z])/g;

  /**
   * @param {string} s
   * @param {string} separator
   */
  const fromCamelCase = (s, separator) => trimLeft(s.replace(fromCamelCaseRegex, match => `${separator}${toLowerCase(match)}`));

  /* istanbul ignore next */
  // @ts-ignore
  const isNode = typeof process !== 'undefined' && process.release && /node|io\.js/.test(process.release.name);
  /* istanbul ignore next */
  const isBrowser = typeof window !== 'undefined' && !isNode;

  /**
   * @type {Map<string,string>}
   */
  let params;

  const computeParamsNode = () => {
    if (params === undefined) {
      params = create();
      const pargs = process.argv;
      let currParamName = null;
      /* istanbul ignore next */
      for (let i = 0; i < pargs.length; i++) {
        const parg = pargs[i];
        if (parg[0] === '-') {
          if (currParamName !== null) {
            params.set(currParamName, '');
          }
          currParamName = parg;
        } else {
          if (currParamName !== null) {
            params.set(currParamName, parg);
            currParamName = null;
          }
        }
      }
    }
    return params
  };

  /* istanbul ignore next */
  const computeParamsBrowser = () => {
    if (params === undefined) {
      params = create()
      // eslint-disable-next-line no-undef
      ;(location.search || '?').slice(1).split('&').forEach(kv => {
        if (kv.length !== 0) {
          const [key, value] = kv.split('=');
          params.set(`--${fromCamelCase(key, '-')}`, value);
          params.set(`-${fromCamelCase(key, '-')}`, value);
        }
      });
    }
    return params
  };

  /* istanbul ignore next */
  const computeParams = isNode ? computeParamsNode : computeParamsBrowser;

  /* istanbul ignore next */
  /**
   * @param {string} name
   * @param {string} defaultVal
   * @return {string}
   */
  const getParam = (name, defaultVal) => computeParams().get(name) || defaultVal;
  // export const getArgs = name => computeParams() && args

  const production = getParam('production', '0') !== '0';

  /**
   * @param {number} len
   */
  const createUint8ArrayFromLen = len => new Uint8Array(len);

  /**
   * Create Uint8Array with initial content from buffer
   *
   * @param {ArrayBuffer} buffer
   * @param {number} byteOffset
   * @param {number} length
   */
  const createUint8ArrayViewFromArrayBuffer = (buffer, byteOffset, length) => new Uint8Array(buffer, byteOffset, length);

  /**
   * Create Uint8Array with initial content from buffer
   *
   * @param {ArrayBuffer} buffer
   */
  const createUint8ArrayFromArrayBuffer = buffer => new Uint8Array(buffer);

  /* istanbul ignore next */
  /**
   * @param {Uint8Array} bytes
   * @return {string}
   */
  const toBase64Browser = bytes => {
    let s = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      s += fromCharCode(bytes[i]);
    }
    // eslint-disable-next-line no-undef
    return btoa(s)
  };

  /**
   * @param {Uint8Array} bytes
   * @return {string}
   */
  const toBase64Node = bytes => Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString('base64');

  /* istanbul ignore next */
  /**
   * @param {string} s
   * @return {Uint8Array}
   */
  const fromBase64Browser = s => {
    // eslint-disable-next-line no-undef
    const a = atob(s);
    const bytes = createUint8ArrayFromLen(a.length);
    for (let i = 0; i < a.length; i++) {
      bytes[i] = a.charCodeAt(i);
    }
    return bytes
  };

  /**
   * @param {string} s
   */
  const fromBase64Node = s => new Uint8Array(Buffer.from(s, 'base64').buffer);

  /* istanbul ignore next */
  const toBase64 = isBrowser ? toBase64Browser : toBase64Node;

  /* istanbul ignore next */
  const fromBase64 = isBrowser ? fromBase64Browser : fromBase64Node;

  /**
   * Copy the content of an Uint8Array view to a new ArrayBuffer.
   *
   * @param {Uint8Array} uint8Array
   * @return {Uint8Array}
   */
  const copyUint8Array = uint8Array => {
    const newBuf = createUint8ArrayFromLen(uint8Array.byteLength);
    newBuf.set(uint8Array);
    return newBuf
  };

  /**
   * @module encoding
   * Encodes numbers in little-endian order (least to most significant byte order)
   * This should be compatible with Golang's binary encoding (https://golang.org/pkg/encoding/binary/)
   * which is also used in Protocol Buffers.
   */

  const bits7 = 0b1111111;
  const bits8 = 0b11111111;

  /**
   * A BinaryEncoder handles the encoding to an Uint8Array.
   */
  class Encoder {
    constructor () {
      this.cpos = 0;
      this.cbuf = new Uint8Array(100);
      /**
       * @type {Array<Uint8Array>}
       */
      this.bufs = [];
    }
  }

  /**
   * @function
   * @return {Encoder}
   */
  const createEncoder = () => new Encoder();

  /**
   * The current length of the encoded data.
   *
   * @function
   * @param {Encoder} encoder
   * @return {number}
   */
  const length = encoder => {
    let len = encoder.cpos;
    for (let i = 0; i < encoder.bufs.length; i++) {
      len += encoder.bufs[i].length;
    }
    return len
  };

  /**
   * Transform to Uint8Array.
   *
   * @function
   * @param {Encoder} encoder
   * @return {Uint8Array} The created ArrayBuffer.
   */
  const toUint8Array = encoder => {
    const uint8arr = new Uint8Array(length(encoder));
    let curPos = 0;
    for (let i = 0; i < encoder.bufs.length; i++) {
      let d = encoder.bufs[i];
      uint8arr.set(d, curPos);
      curPos += d.length;
    }
    uint8arr.set(createUint8ArrayViewFromArrayBuffer(encoder.cbuf.buffer, 0, encoder.cpos), curPos);
    return uint8arr
  };

  /**
   * Write one byte to the encoder.
   *
   * @function
   * @param {Encoder} encoder
   * @param {number} num The byte that is to be encoded.
   */
  const write = (encoder, num) => {
    if (encoder.cpos === encoder.cbuf.length) {
      encoder.bufs.push(encoder.cbuf);
      encoder.cbuf = new Uint8Array(encoder.cbuf.length * 2);
      encoder.cpos = 0;
    }
    encoder.cbuf[encoder.cpos++] = num;
  };

  /**
   * Write one byte as an unsigned integer.
   *
   * @function
   * @param {Encoder} encoder
   * @param {number} num The number that is to be encoded.
   */
  const writeUint8 = (encoder, num) => write(encoder, num & bits8);

  /**
   * Write a variable length unsigned integer.
   *
   * Encodes integers in the range from [0, 4294967295] / [0, 0xffffffff]. (max 32 bit unsigned integer)
   *
   * @function
   * @param {Encoder} encoder
   * @param {number} num The number that is to be encoded.
   */
  const writeVarUint = (encoder, num) => {
    while (num >= 0b10000000) {
      write(encoder, 0b10000000 | (bits7 & num));
      num >>>= 7;
    }
    write(encoder, bits7 & num);
  };

  /**
   * Write a variable length string.
   *
   * @function
   * @param {Encoder} encoder
   * @param {String} str The string that is to be encoded.
   */
  const writeVarString = (encoder, str) => {
    const encodedString = unescape(encodeURIComponent(str));
    const len = encodedString.length;
    writeVarUint(encoder, len);
    for (let i = 0; i < len; i++) {
      // @ts-ignore
      write(encoder, encodedString.codePointAt(i));
    }
  };

  /**
   * Append fixed-length Uint8Array to the encoder.
   *
   * @function
   * @param {Encoder} encoder
   * @param {Uint8Array} uint8Array
   */
  const writeUint8Array = (encoder, uint8Array) => {
    const prevBufferLen = encoder.cbuf.length;
    // TODO: Append to cbuf if possible
    encoder.bufs.push(createUint8ArrayViewFromArrayBuffer(encoder.cbuf.buffer, 0, encoder.cpos));
    encoder.bufs.push(uint8Array);
    encoder.cbuf = createUint8ArrayFromLen(prevBufferLen);
    encoder.cpos = 0;
  };

  /**
   * Append an Uint8Array to Encoder.
   *
   * @function
   * @param {Encoder} encoder
   * @param {Uint8Array} uint8Array
   */
  const writeVarUint8Array = (encoder, uint8Array) => {
    writeVarUint(encoder, uint8Array.byteLength);
    writeUint8Array(encoder, uint8Array);
  };

  /**
   * @module decoding
   */

  /**
   * A Decoder handles the decoding of an Uint8Array.
   */
  class Decoder {
    /**
     * @param {Uint8Array} uint8Array Binary data to decode
     */
    constructor (uint8Array) {
      this.arr = uint8Array;
      this.pos = 0;
    }
  }

  /**
   * @function
   * @param {Uint8Array} uint8Array
   * @return {Decoder}
   */
  const createDecoder = uint8Array => new Decoder(uint8Array);

  /**
   * Create an Uint8Array view of the next `len` bytes and advance the position by `len`.
   *
   * Important: The Uint8Array still points to the underlying ArrayBuffer. Make sure to discard the result as soon as possible to prevent any memory leaks.
   *            Use `buffer.copyUint8Array` to copy the result into a new Uint8Array.
   *
   * @function
   * @param {Decoder} decoder The decoder instance
   * @param {number} len The length of bytes to read
   * @return {Uint8Array}
   */
  const readUint8Array = (decoder, len) => {
    const view = createUint8ArrayViewFromArrayBuffer(decoder.arr.buffer, decoder.pos, len);
    decoder.pos += len;
    return view
  };

  /**
   * Read variable length Uint8Array.
   *
   * Important: The Uint8Array still points to the underlying ArrayBuffer. Make sure to discard the result as soon as possible to prevent any memory leaks.
   *            Use `buffer.copyUint8Array` to copy the result into a new Uint8Array.
   *
   * @function
   * @param {Decoder} decoder
   * @return {Uint8Array}
   */
  const readVarUint8Array = decoder => readUint8Array(decoder, readVarUint(decoder));

  /**
   * Read one byte as unsigned integer.
   * @function
   * @param {Decoder} decoder The decoder instance
   * @return {number} Unsigned 8-bit integer
   */
  const readUint8 = decoder => decoder.arr[decoder.pos++];

  /**
   * Read unsigned integer (32bit) with variable length.
   * 1/8th of the storage is used as encoding overhead.
   *  * numbers < 2^7 is stored in one bytlength
   *  * numbers < 2^14 is stored in two bylength
   *
   * @function
   * @param {Decoder} decoder
   * @return {number} An unsigned integer.length
   */
  const readVarUint = decoder => {
    let num = 0;
    let len = 0;
    while (true) {
      let r = decoder.arr[decoder.pos++];
      num = num | ((r & 0b1111111) << len);
      len += 7;
      if (r < 1 << 7) {
        return num >>> 0 // return unsigned number!
      }
      /* istanbul ignore if */
      if (len > 35) {
        throw new Error('Integer out of range!')
      }
    }
  };

  /**
   * Read string of variable length
   * * varUint is used to store the length of the string
   *
   * Transforming utf8 to a string is pretty expensive. The code performs 10x better
   * when String.fromCodePoint is fed with all characters as arguments.
   * But most environments have a maximum number of arguments per functions.
   * For effiency reasons we apply a maximum of 10000 characters at once.
   *
   * @function
   * @param {Decoder} decoder
   * @return {String} The read String.
   */
  const readVarString = decoder => {
    let remainingLen = readVarUint(decoder);
    let encodedString = '';
    while (remainingLen > 0) {
      const nextLen = remainingLen < 10000 ? remainingLen : 10000;
      const bytes = new Array(nextLen);
      for (let i = 0; i < nextLen; i++) {
        bytes[i] = decoder.arr[decoder.pos++];
      }
      encodedString += String.fromCodePoint.apply(null, bytes);
      remainingLen -= nextLen;
    }
    return decodeURIComponent(escape(encodedString))
  };

  /**
   * Calls all functions in `fs` with args. Only throws after all functions were called.
   *
   * @param {Array<function>} fs
   * @param {Array<any>} args
   */
  const callAll = (fs, args, i = 0) => {
    try {
      for (; i < fs.length; i++) {
        fs[i](...args);
      }
    } finally {
      if (i < fs.length) {
        callAll(fs, args, i + 1);
      }
    }
  };

  /**
   * @throws
   * @return {never}
   */
  const methodUnimplemented = () => {
    throw new Error('Method unimplemented')
  };

  /**
   * @throws
   * @return {never}
   */
  const unexpectedCase = () => {
    throw new Error('Unexpected case')
  };

  /**
   * @param {string} s
   * @return {Error}
   */
  const create$1 = s => new Error(s);

  const create$2 = () => new Set();

  const getUnixTime = Date.now;

  /**
   * Handles named events.
   *
   * @template N
   */
  class Observable {
    constructor () {
      /**
       * @type {Map<N, any>}
       */
      this._observers = create();
    }

    /**
     * @param {N} name
     * @param {function} f
     */
    on (name, f) {
      setIfUndefined(this._observers, name, create$2).add(f);
    }

    /**
     * @param {N} name
     * @param {function} f
     */
    once (name, f) {
      /**
       * @param  {...any} args
       */
      const _f = (...args) => {
        this.off(name, f);
        f(...args);
      };
      this.on(name, _f);
    }

    /**
     * @param {N} name
     * @param {function} f
     */
    off (name, f) {
      const observers = this._observers.get(name);
      if (observers !== undefined) {
        observers.delete(f);
        if (observers.size === 0) {
          this._observers.delete(name);
        }
      }
    }

    /**
     * Emit a named event. All registered event listeners that listen to the
     * specified name will receive the event.
     *
     * @param {N} name The event name.
     * @param {Array} args The arguments that are applied to the event listener.
     */
    emit (name, args) {
      // @ts-ignore
      return (this._observers.get(name) || create()).forEach(f => f(...args))
    }

    destroy () {
      this._observers = create();
    }
  }

  /* eslint-env browser */
  const BIT6 = 32;
  const BIT7 = 64;
  const BIT8 = 128;
  const BITS5 = 31;
  const BITS32 = 0xFFFFFFFF;

  /* global crypto */

  /* istanbul ignore next */
  const uint32BrowserCrypto = () => {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0]
  };

  /* istanbul ignore next */
  const uint32NoCrypto = () => Math.ceil((Math.random() * BITS32) >>> 0);

  /**
   * @param {typeof import('crypto')} crypto
   * @return {function():number}
   */
  const uint32NodeCrypto = crypto => () => {
    // @ts-ignore
    const buf = crypto.randomBytes(4);
    return new Uint32Array(buf.buffer)[0]
  };

  /* istanbul ignore next */
  const uint32 = isBrowser
    ? (typeof crypto === 'undefined' ? uint32NoCrypto : uint32BrowserCrypto)
    : uint32NodeCrypto(require('crypto'));

  /**
   * @template T,R
   * @param {Iterator<T>} iterator
   * @param {function(T):R} f
   * @return {Iterator<R>}
   */

  /**
   * @template T
   * @param {function():{done:boolean,value:T|undefined}} next
   * @return {IterableIterator<T>}
   */
  const createIterator = next => ({
    /**
     * @return {IterableIterator<T>}
     */
    [Symbol.iterator] () {
      return this
    },
    // @ts-ignore
    next
  });

  /**
   * @template T
   * @param {Iterator<T>} iterator
   * @param {function(T):boolean} filter
   */
  const iteratorFilter = (iterator, filter) => createIterator(() => {
    let res;
    do {
      res = iterator.next();
    } while (!res.done && !filter(res.value))
    return res
  });

  /**
   * @template T,M
   * @param {Iterator<T>} iterator
   * @param {function(T):M} fmap
   */
  const iteratorMap = (iterator, fmap) => createIterator(() => {
    const { done, value } = iterator.next();
    return { done, value: done ? undefined : fmap(value) }
  });

  class DeleteItem {
    /**
     * @param {number} clock
     * @param {number} len
     */
    constructor (clock, len) {
      /**
       * @type {number}
       */
      this.clock = clock;
      /**
       * @type {number}
       */
      this.len = len;
    }
  }

  /**
   * We no longer maintain a DeleteStore. DeleteSet is a temporary object that is created when needed.
   * - When created in a transaction, it must only be accessed after sorting, and merging
   *   - This DeleteSet is send to other clients
   * - We do not create a DeleteSet when we send a sync message. The DeleteSet message is created directly from StructStore
   * - We read a DeleteSet as part of a sync/update message. In this case the DeleteSet is already sorted and merged.
   */
  class DeleteSet {
    constructor () {
      /**
       * @type {Map<number,Array<DeleteItem>>}
       * @private
       */
      this.clients = new Map();
    }
  }

  /**
   * Iterate over all structs that the DeleteSet gc's.
   *
   * @param {Transaction} transaction
   * @param {DeleteSet} ds
   * @param {StructStore} store
   * @param {function(GC|Item):void} f
   *
   * @function
   */
  const iterateDeletedStructs = (transaction, ds, store, f) =>
    ds.clients.forEach((deletes, clientid) => {
      const structs = /** @type {Array<GC|Item>} */ (store.clients.get(clientid));
      for (let i = 0; i < deletes.length; i++) {
        const del = deletes[i];
        iterateStructs(transaction, structs, del.clock, del.len, f);
      }
    });

  /**
   * @param {Array<DeleteItem>} dis
   * @param {number} clock
   * @return {number|null}
   *
   * @private
   * @function
   */
  const findIndexDS = (dis, clock) => {
    let left = 0;
    let right = dis.length - 1;
    while (left <= right) {
      const midindex = floor((left + right) / 2);
      const mid = dis[midindex];
      const midclock = mid.clock;
      if (midclock <= clock) {
        if (clock < midclock + mid.len) {
          return midindex
        }
        left = midindex + 1;
      } else {
        right = midindex - 1;
      }
    }
    return null
  };

  /**
   * @param {DeleteSet} ds
   * @param {ID} id
   * @return {boolean}
   *
   * @private
   * @function
   */
  const isDeleted = (ds, id) => {
    const dis = ds.clients.get(id.client);
    return dis !== undefined && findIndexDS(dis, id.clock) !== null
  };

  /**
   * @param {DeleteSet} ds
   *
   * @private
   * @function
   */
  const sortAndMergeDeleteSet = ds => {
    ds.clients.forEach(dels => {
      dels.sort((a, b) => a.clock - b.clock);
      // merge items without filtering or splicing the array
      // i is the current pointer
      // j refers to the current insert position for the pointed item
      // try to merge dels[i] into dels[j-1] or set dels[j]=dels[i]
      let i, j;
      for (i = 1, j = 1; i < dels.length; i++) {
        const left = dels[j - 1];
        const right = dels[i];
        if (left.clock + left.len === right.clock) {
          left.len += right.len;
        } else {
          if (j < i) {
            dels[j] = right;
          }
          j++;
        }
      }
      dels.length = j;
    });
  };

  /**
   * @param {DeleteSet} ds1
   * @param {DeleteSet} ds2
   * @return {DeleteSet} A fresh DeleteSet
   */
  const mergeDeleteSets = (ds1, ds2) => {
    const merged = new DeleteSet();
    // Write all keys from ds1 to merged. If ds2 has the same key, combine the sets.
    ds1.clients.forEach((dels1, client) =>
      merged.clients.set(client, dels1.concat(ds2.clients.get(client) || []))
    );
    // Write all missing keys from ds2 to merged.
    ds2.clients.forEach((dels2, client) => {
      if (!merged.clients.has(client)) {
        merged.clients.set(client, dels2);
      }
    });
    sortAndMergeDeleteSet(merged);
    return merged
  };

  /**
   * @param {DeleteSet} ds
   * @param {ID} id
   * @param {number} length
   *
   * @private
   * @function
   */
  const addToDeleteSet = (ds, id, length) => {
    setIfUndefined(ds.clients, id.client, () => []).push(new DeleteItem(id.clock, length));
  };

  /**
   * @param {StructStore} ss
   * @return {DeleteSet} Merged and sorted DeleteSet
   *
   * @private
   * @function
   */
  const createDeleteSetFromStructStore = ss => {
    const ds = new DeleteSet();
    ss.clients.forEach((structs, client) => {
      /**
       * @type {Array<DeleteItem>}
       */
      const dsitems = [];
      for (let i = 0; i < structs.length; i++) {
        const struct = structs[i];
        if (struct.deleted) {
          const clock = struct.id.clock;
          let len = struct.length;
          if (i + 1 < structs.length) {
            for (let next = structs[i + 1]; i + 1 < structs.length && next.id.clock === clock + len && next.deleted; next = structs[++i + 1]) {
              len += next.length;
            }
          }
          dsitems.push(new DeleteItem(clock, len));
        }
      }
      if (dsitems.length > 0) {
        ds.clients.set(client, dsitems);
      }
    });
    return ds
  };

  /**
   * @param {encoding.Encoder} encoder
   * @param {DeleteSet} ds
   *
   * @private
   * @function
   */
  const writeDeleteSet = (encoder, ds) => {
    writeVarUint(encoder, ds.clients.size);
    ds.clients.forEach((dsitems, client) => {
      writeVarUint(encoder, client);
      const len = dsitems.length;
      writeVarUint(encoder, len);
      for (let i = 0; i < len; i++) {
        const item = dsitems[i];
        writeVarUint(encoder, item.clock);
        writeVarUint(encoder, item.len);
      }
    });
  };

  /**
   * @param {decoding.Decoder} decoder
   * @param {Transaction} transaction
   * @param {StructStore} store
   *
   * @private
   * @function
   */
  const readDeleteSet = (decoder, transaction, store) => {
    const unappliedDS = new DeleteSet();
    const numClients = readVarUint(decoder);
    for (let i = 0; i < numClients; i++) {
      const client = readVarUint(decoder);
      const numberOfDeletes = readVarUint(decoder);
      const structs = store.clients.get(client) || [];
      const state = getState(store, client);
      for (let i = 0; i < numberOfDeletes; i++) {
        const clock = readVarUint(decoder);
        const len = readVarUint(decoder);
        if (clock < state) {
          if (state < clock + len) {
            addToDeleteSet(unappliedDS, createID(client, state), clock + len - state);
          }
          let index = findIndexSS(structs, clock);
          /**
           * We can ignore the case of GC and Delete structs, because we are going to skip them
           * @type {Item}
           */
          // @ts-ignore
          let struct = structs[index];
          // split the first item if necessary
          if (!struct.deleted && struct.id.clock < clock) {
            structs.splice(index + 1, 0, splitItem(transaction, struct, clock - struct.id.clock));
            index++; // increase we now want to use the next struct
          }
          while (index < structs.length) {
            // @ts-ignore
            struct = structs[index++];
            if (struct.id.clock < clock + len) {
              if (!struct.deleted) {
                if (clock + len < struct.id.clock + struct.length) {
                  structs.splice(index, 0, splitItem(transaction, struct, clock + len - struct.id.clock));
                }
                struct.delete(transaction);
              }
            } else {
              break
            }
          }
        } else {
          addToDeleteSet(unappliedDS, createID(client, clock), len);
        }
      }
    }
    if (unappliedDS.clients.size > 0) {
      const unappliedDSEncoder = createEncoder();
      writeDeleteSet(unappliedDSEncoder, unappliedDS);
      store.pendingDeleteReaders.push(createDecoder(toUint8Array(unappliedDSEncoder)));
    }
  };

  /**
   * General event handler implementation.
   *
   * @template ARG0, ARG1
   *
   * @private
   */
  class EventHandler {
    constructor () {
      /**
       * @type {Array<function(ARG0, ARG1):void>}
       */
      this.l = [];
    }
  }

  /**
   * @template ARG0,ARG1
   * @returns {EventHandler<ARG0,ARG1>}
   *
   * @private
   * @function
   */
  const createEventHandler = () => new EventHandler();

  /**
   * Adds an event listener that is called when
   * {@link EventHandler#callEventListeners} is called.
   *
   * @template ARG0,ARG1
   * @param {EventHandler<ARG0,ARG1>} eventHandler
   * @param {function(ARG0,ARG1):void} f The event handler.
   *
   * @private
   * @function
   */
  const addEventHandlerListener = (eventHandler, f) =>
    eventHandler.l.push(f);

  /**
   * Removes an event listener.
   *
   * @template ARG0,ARG1
   * @param {EventHandler<ARG0,ARG1>} eventHandler
   * @param {function(ARG0,ARG1):void} f The event handler that was added with
   *                     {@link EventHandler#addEventListener}
   *
   * @private
   * @function
   */
  const removeEventHandlerListener = (eventHandler, f) => {
    eventHandler.l = eventHandler.l.filter(g => f !== g);
  };

  /**
   * Call all event listeners that were added via
   * {@link EventHandler#addEventListener}.
   *
   * @template ARG0,ARG1
   * @param {EventHandler<ARG0,ARG1>} eventHandler
   * @param {ARG0} arg0
   * @param {ARG1} arg1
   *
   * @private
   * @function
   */
  const callEventHandlerListeners = (eventHandler, arg0, arg1) =>
    callAll(eventHandler.l, [arg0, arg1]);

  class ID {
    /**
     * @param {number} client client id
     * @param {number} clock unique per client id, continuous number
     */
    constructor (client, clock) {
      /**
       * Client id
       * @type {number}
       */
      this.client = client;
      /**
       * unique per client id, continuous number
       * @type {number}
       */
      this.clock = clock;
    }
  }

  /**
   * @param {ID | null} a
   * @param {ID | null} b
   * @return {boolean}
   *
   * @function
   */
  const compareIDs = (a, b) => a === b || (a !== null && b !== null && a.client === b.client && a.clock === b.clock);

  /**
   * @param {number} client
   * @param {number} clock
   *
   * @private
   * @function
   */
  const createID = (client, clock) => new ID(client, clock);

  /**
   * @param {encoding.Encoder} encoder
   * @param {ID} id
   *
   * @private
   * @function
   */
  const writeID = (encoder, id) => {
    writeVarUint(encoder, id.client);
    writeVarUint(encoder, id.clock);
  };

  /**
   * Read ID.
   * * If first varUint read is 0xFFFFFF a RootID is returned.
   * * Otherwise an ID is returned
   *
   * @param {decoding.Decoder} decoder
   * @return {ID}
   *
   * @private
   * @function
   */
  const readID = decoder =>
    createID(readVarUint(decoder), readVarUint(decoder));

  /**
   * The top types are mapped from y.share.get(keyname) => type.
   * `type` does not store any information about the `keyname`.
   * This function finds the correct `keyname` for `type` and throws otherwise.
   *
   * @param {AbstractType<any>} type
   * @return {string}
   *
   * @private
   * @function
   */
  const findRootTypeKey = type => {
    // @ts-ignore _y must be defined, otherwise unexpected case
    for (let [key, value] of type.doc.share) {
      if (value === type) {
        return key
      }
    }
    throw unexpectedCase()
  };

  /**
   * Check if `parent` is a parent of `child`.
   *
   * @param {AbstractType<any>} parent
   * @param {Item|null} child
   * @return {Boolean} Whether `parent` is a parent of `child`.
   *
   * @private
   * @function
   */
  const isParentOf = (parent, child) => {
    while (child !== null) {
      if (child.parent === parent) {
        return true
      }
      child = child.parent._item;
    }
    return false
  };

  /**
   * A relative position is based on the Yjs model and is not affected by document changes.
   * E.g. If you place a relative position before a certain character, it will always point to this character.
   * If you place a relative position at the end of a type, it will always point to the end of the type.
   *
   * A numeric position is often unsuited for user selections, because it does not change when content is inserted
   * before or after.
   *
   * ```Insert(0, 'x')('a|bc') = 'xa|bc'``` Where | is the relative position.
   *
   * One of the properties must be defined.
   *
   * @example
   *   // Current cursor position is at position 10
   *   const relativePosition = createRelativePositionFromIndex(yText, 10)
   *   // modify yText
   *   yText.insert(0, 'abc')
   *   yText.delete(3, 10)
   *   // Compute the cursor position
   *   const absolutePosition = createAbsolutePositionFromRelativePosition(y, relativePosition)
   *   absolutePosition.type === yText // => true
   *   console.log('cursor location is ' + absolutePosition.index) // => cursor location is 3
   *
   */
  class RelativePosition {
    /**
     * @param {ID|null} type
     * @param {string|null} tname
     * @param {ID|null} item
     */
    constructor (type, tname, item) {
      /**
       * @type {ID|null}
       */
      this.type = type;
      /**
       * @type {string|null}
       */
      this.tname = tname;
      /**
       * @type {ID | null}
       */
      this.item = item;
    }
  }

  /**
   * @param {Object} json
   * @return {RelativePosition}
   *
   * @function
   */
  const createRelativePositionFromJSON = json => new RelativePosition(json.type == null ? null : createID(json.type.client, json.type.clock), json.tname || null, json.item == null ? null : createID(json.item.client, json.item.clock));

  class AbsolutePosition {
    /**
     * @param {AbstractType<any>} type
     * @param {number} index
     */
    constructor (type, index) {
      /**
       * @type {AbstractType<any>}
       */
      this.type = type;
      /**
       * @type {number}
       */
      this.index = index;
    }
  }

  /**
   * @param {AbstractType<any>} type
   * @param {number} index
   *
   * @function
   */
  const createAbsolutePosition = (type, index) => new AbsolutePosition(type, index);

  /**
   * @param {AbstractType<any>} type
   * @param {ID|null} item
   *
   * @function
   */
  const createRelativePosition = (type, item) => {
    let typeid = null;
    let tname = null;
    if (type._item === null) {
      tname = findRootTypeKey(type);
    } else {
      typeid = type._item.id;
    }
    return new RelativePosition(typeid, tname, item)
  };

  /**
   * Create a relativePosition based on a absolute position.
   *
   * @param {AbstractType<any>} type The base type (e.g. YText or YArray).
   * @param {number} index The absolute position.
   * @return {RelativePosition}
   *
   * @function
   */
  const createRelativePositionFromTypeIndex = (type, index) => {
    let t = type._start;
    while (t !== null) {
      if (!t.deleted && t.countable) {
        if (t.length > index) {
          // case 1: found position somewhere in the linked list
          return createRelativePosition(type, createID(t.id.client, t.id.clock + index))
        }
        index -= t.length;
      }
      t = t.right;
    }
    return createRelativePosition(type, null)
  };

  /**
   * @param {RelativePosition} rpos
   * @param {Doc} doc
   * @return {AbsolutePosition|null}
   *
   * @function
   */
  const createAbsolutePositionFromRelativePosition = (rpos, doc) => {
    const store = doc.store;
    const rightID = rpos.item;
    const typeID = rpos.type;
    const tname = rpos.tname;
    let type = null;
    let index = 0;
    if (rightID !== null) {
      if (getState(store, rightID.client) <= rightID.clock) {
        return null
      }
      const res = followRedone(store, rightID);
      const right = res.item;
      if (!(right instanceof Item)) {
        return null
      }
      type = right.parent;
      if (type._item !== null && !type._item.deleted) {
        index = right.deleted || !right.countable ? 0 : res.diff;
        let n = right.left;
        while (n !== null) {
          if (!n.deleted && n.countable) {
            index += n.length;
          }
          n = n.left;
        }
      }
    } else {
      if (tname !== null) {
        type = doc.get(tname);
      } else if (typeID !== null) {
        if (getState(store, typeID.client) <= typeID.clock) {
          // type does not exist yet
          return null
        }
        const { item } = followRedone(store, typeID);
        if (item instanceof Item && item.content instanceof ContentType) {
          type = item.content.type;
        } else {
          // struct is garbage collected
          return null
        }
      } else {
        throw unexpectedCase()
      }
      index = type._length;
    }
    return createAbsolutePosition(type, index)
  };

  /**
   * @param {RelativePosition|null} a
   * @param {RelativePosition|null} b
   *
   * @function
   */
  const compareRelativePositions = (a, b) => a === b || (
    a !== null && b !== null && a.tname === b.tname && compareIDs(a.item, b.item) && compareIDs(a.type, b.type)
  );

  class Snapshot {
    /**
     * @param {DeleteSet} ds
     * @param {Map<number,number>} sm state map
     */
    constructor (ds, sm) {
      /**
       * @type {DeleteSet}
       * @private
       */
      this.ds = ds;
      /**
       * State Map
       * @type {Map<number,number>}
       * @private
       */
      this.sm = sm;
    }
  }

  /**
   * @param {Item} item
   * @param {Snapshot|undefined} snapshot
   *
   * @protected
   * @function
   */
  const isVisible = (item, snapshot) => snapshot === undefined ? !item.deleted : (
    snapshot.sm.has(item.id.client) && (snapshot.sm.get(item.id.client) || 0) > item.id.clock && !isDeleted(snapshot.ds, item.id)
  );

  class StructStore {
    constructor () {
      /**
       * @type {Map<number,Array<GC|Item>>}
       * @private
       */
      this.clients = new Map();
      /**
       * Store incompleted struct reads here
       * `i` denotes to the next read operation
       * We could shift the array of refs instead, but shift is incredible
       * slow in Chrome for arrays with more than 100k elements
       * @see tryResumePendingStructRefs
       * @type {Map<number,{i:number,refs:Array<GCRef|ItemRef>}>}
       * @private
       */
      this.pendingClientsStructRefs = new Map();
      /**
       * Stack of pending structs waiting for struct dependencies
       * Maximum length of stack is structReaders.size
       * @type {Array<GCRef|ItemRef>}
       * @private
       */
      this.pendingStack = [];
      /**
       * @type {Array<decoding.Decoder>}
       * @private
       */
      this.pendingDeleteReaders = [];
    }
  }

  /**
   * Return the states as a Map<client,clock>.
   * Note that clock refers to the next expected clock id.
   *
   * @param {StructStore} store
   * @return {Map<number,number>}
   *
   * @public
   * @function
   */
  const getStateVector = store => {
    const sm = new Map();
    store.clients.forEach((structs, client) => {
      const struct = structs[structs.length - 1];
      sm.set(client, struct.id.clock + struct.length);
    });
    return sm
  };

  /**
   * @param {StructStore} store
   * @param {number} client
   * @return {number}
   *
   * @public
   * @function
   */
  const getState = (store, client) => {
    const structs = store.clients.get(client);
    if (structs === undefined) {
      return 0
    }
    const lastStruct = structs[structs.length - 1];
    return lastStruct.id.clock + lastStruct.length
  };

  /**
   * @param {StructStore} store
   * @param {GC|Item} struct
   *
   * @private
   * @function
   */
  const addStruct = (store, struct) => {
    let structs = store.clients.get(struct.id.client);
    if (structs === undefined) {
      structs = [];
      store.clients.set(struct.id.client, structs);
    } else {
      const lastStruct = structs[structs.length - 1];
      if (lastStruct.id.clock + lastStruct.length !== struct.id.clock) {
        throw unexpectedCase()
      }
    }
    structs.push(struct);
  };

  /**
   * Perform a binary search on a sorted array
   * @param {Array<any>} structs
   * @param {number} clock
   * @return {number}
   *
   * @private
   * @function
   */
  const findIndexSS = (structs, clock) => {
    let left = 0;
    let right = structs.length - 1;
    while (left <= right) {
      const midindex = floor((left + right) / 2);
      const mid = structs[midindex];
      const midclock = mid.id.clock;
      if (midclock <= clock) {
        if (clock < midclock + mid.length) {
          return midindex
        }
        left = midindex + 1;
      } else {
        right = midindex - 1;
      }
    }
    // Always check state before looking for a struct in StructStore
    // Therefore the case of not finding a struct is unexpected
    throw unexpectedCase()
  };

  /**
   * Expects that id is actually in store. This function throws or is an infinite loop otherwise.
   *
   * @param {StructStore} store
   * @param {ID} id
   * @return {GC|Item}
   *
   * @private
   * @function
   */
  const find = (store, id) => {
    /**
     * @type {Array<GC|Item>}
     */
    // @ts-ignore
    const structs = store.clients.get(id.client);
    return structs[findIndexSS(structs, id.clock)]
  };

  /**
   * Expects that id is actually in store. This function throws or is an infinite loop otherwise.
   *
   * @param {StructStore} store
   * @param {ID} id
   * @return {Item}
   *
   * @private
   * @function
   */
  // @ts-ignore
  const getItem = (store, id) => find(store, id);

  /**
   * @param {Transaction} transaction
   * @param {Array<Item|GC>} structs
   * @param {number} clock
   */
  const findIndexCleanStart = (transaction, structs, clock) => {
    const index = findIndexSS(structs, clock);
    let struct = structs[index];
    if (struct.id.clock < clock && struct instanceof Item) {
      structs.splice(index + 1, 0, splitItem(transaction, struct, clock - struct.id.clock));
      return index + 1
    }
    return index
  };

  /**
   * Expects that id is actually in store. This function throws or is an infinite loop otherwise.
   *
   * @param {Transaction} transaction
   * @param {StructStore} store
   * @param {ID} id
   * @return {Item}
   *
   * @private
   * @function
   */
  const getItemCleanStart = (transaction, store, id) => {
    const structs = /** @type {Array<GC|Item>} */ (store.clients.get(id.client));
    return /** @type {Item} */ (structs[findIndexCleanStart(transaction, structs, id.clock)])
  };

  /**
   * Expects that id is actually in store. This function throws or is an infinite loop otherwise.
   *
   * @param {Transaction} transaction
   * @param {StructStore} store
   * @param {ID} id
   * @return {Item}
   *
   * @private
   * @function
   */
  const getItemCleanEnd = (transaction, store, id) => {
    /**
     * @type {Array<Item>}
     */
    // @ts-ignore
    const structs = store.clients.get(id.client);
    const index = findIndexSS(structs, id.clock);
    const struct = structs[index];
    if (id.clock !== struct.id.clock + struct.length - 1 && struct.constructor !== GC) {
      structs.splice(index + 1, 0, splitItem(transaction, struct, id.clock - struct.id.clock + 1));
    }
    return struct
  };

  /**
   * Replace `item` with `newitem` in store
   * @param {StructStore} store
   * @param {GC|Item} struct
   * @param {GC|Item} newStruct
   *
   * @private
   * @function
   */
  const replaceStruct = (store, struct, newStruct) => {
    const structs = /** @type {Array<GC|Item>} */ (store.clients.get(struct.id.client));
    structs[findIndexSS(structs, struct.id.clock)] = newStruct;
  };

  /**
   * Iterate over a range of structs
   *
   * @param {Transaction} transaction
   * @param {Array<Item|GC>} structs
   * @param {number} clockStart Inclusive start
   * @param {number} len
   * @param {function(GC|Item):void} f
   *
   * @function
   */
  const iterateStructs = (transaction, structs, clockStart, len, f) => {
    if (len === 0) {
      return
    }
    const clockEnd = clockStart + len;
    let index = findIndexCleanStart(transaction, structs, clockStart);
    let struct;
    do {
      struct = structs[index++];
      if (clockEnd < struct.id.clock + struct.length) {
        findIndexCleanStart(transaction, structs, clockEnd);
      }
      f(struct);
    } while (index < structs.length && structs[index].id.clock < clockEnd)
  };

  /**
   * A transaction is created for every change on the Yjs model. It is possible
   * to bundle changes on the Yjs model in a single transaction to
   * minimize the number on messages sent and the number of observer calls.
   * If possible the user of this library should bundle as many changes as
   * possible. Here is an example to illustrate the advantages of bundling:
   *
   * @example
   * const map = y.define('map', YMap)
   * // Log content when change is triggered
   * map.observe(() => {
   *   console.log('change triggered')
   * })
   * // Each change on the map type triggers a log message:
   * map.set('a', 0) // => "change triggered"
   * map.set('b', 0) // => "change triggered"
   * // When put in a transaction, it will trigger the log after the transaction:
   * y.transact(() => {
   *   map.set('a', 1)
   *   map.set('b', 1)
   * }) // => "change triggered"
   *
   * @public
   */
  class Transaction {
    /**
     * @param {Doc} doc
     * @param {any} origin
     */
    constructor (doc, origin) {
      /**
       * The Yjs instance.
       * @type {Doc}
       */
      this.doc = doc;
      /**
       * Describes the set of deleted items by ids
       * @type {DeleteSet}
       */
      this.deleteSet = new DeleteSet();
      /**
       * Holds the state before the transaction started.
       * @type {Map<Number,Number>}
       */
      this.beforeState = getStateVector(doc.store);
      /**
       * Holds the state after the transaction.
       * @type {Map<Number,Number>}
       */
      this.afterState = new Map();
      /**
       * All types that were directly modified (property added or child
       * inserted/deleted). New types are not included in this Set.
       * Maps from type to parentSubs (`item._parentSub = null` for YArray)
       * @type {Map<AbstractType<YEvent>,Set<String|null>>}
       */
      this.changed = new Map();
      /**
       * Stores the events for the types that observe also child elements.
       * It is mainly used by `observeDeep`.
       * @type {Map<AbstractType<YEvent>,Array<YEvent>>}
       */
      this.changedParentTypes = new Map();
      /**
       * @type {Set<ID>}
       * @private
       */
      this._mergeStructs = new Set();
      /**
       * @type {any}
       */
      this.origin = origin;
    }
  }

  /**
   * @param {Transaction} transaction
   */
  const computeUpdateMessageFromTransaction = transaction => {
    if (transaction.deleteSet.clients.size === 0 && !any(transaction.afterState, (clock, client) => transaction.beforeState.get(client) !== clock)) {
      return null
    }
    const encoder = createEncoder();
    sortAndMergeDeleteSet(transaction.deleteSet);
    writeStructsFromTransaction(encoder, transaction);
    writeDeleteSet(encoder, transaction.deleteSet);
    return encoder
  };

  /**
   * @param {Transaction} transaction
   *
   * @private
   * @function
   */
  const nextID = transaction => {
    const y = transaction.doc;
    return createID(y.clientID, getState(y.store, y.clientID))
  };

  /**
   * If `type.parent` was added in current transaction, `type` technically
   * did not change, it was just added and we should not fire events for `type`.
   *
   * @param {Transaction} transaction
   * @param {AbstractType<YEvent>} type
   * @param {string|null} parentSub
   */
  const addChangedTypeToTransaction = (transaction, type, parentSub) => {
    const item = type._item;
    if (item === null || (item.id.clock < (transaction.beforeState.get(item.id.client) || 0) && !item.deleted)) {
      setIfUndefined(transaction.changed, type, create$2).add(parentSub);
    }
  };

  /**
   * Implements the functionality of `y.transact(()=>{..})`
   *
   * @param {Doc} doc
   * @param {function(Transaction):void} f
   * @param {any} [origin]
   *
   * @private
   * @function
   */
  const transact = (doc, f, origin = null) => {
    const transactionCleanups = doc._transactionCleanups;
    let initialCall = false;
    if (doc._transaction === null) {
      initialCall = true;
      doc._transaction = new Transaction(doc, origin);
      transactionCleanups.push(doc._transaction);
      doc.emit('beforeTransaction', [doc._transaction, doc]);
    }
    try {
      f(doc._transaction);
    } finally {
      if (initialCall && transactionCleanups[0] === doc._transaction) {
        // The first transaction ended, now process observer calls.
        // Observer call may create new transactions for which we need to call the observers and do cleanup.
        // We don't want to nest these calls, so we execute these calls one after another
        for (let i = 0; i < transactionCleanups.length; i++) {
          const transaction = transactionCleanups[i];
          const store = transaction.doc.store;
          const ds = transaction.deleteSet;
          sortAndMergeDeleteSet(ds);
          transaction.afterState = getStateVector(transaction.doc.store);
          doc._transaction = null;
          doc.emit('beforeObserverCalls', [transaction, doc]);
          // emit change events on changed types
          transaction.changed.forEach((subs, itemtype) => {
            if (itemtype._item === null || !itemtype._item.deleted) {
              itemtype._callObserver(transaction, subs);
            }
          });
          transaction.changedParentTypes.forEach((events, type) => {
            // We need to think about the possibility that the user transforms the
            // Y.Doc in the event.
            if (type._item === null || !type._item.deleted) {
              events = events
                .filter(event =>
                  event.target._item === null || !event.target._item.deleted
                );
              events
                .forEach(event => {
                  event.currentTarget = type;
                });
              // We don't need to check for events.length
              // because we know it has at least one element
              callEventHandlerListeners(type._dEH, events, transaction);
            }
          });
          doc.emit('afterTransaction', [transaction, doc]);
          /**
           * @param {Array<AbstractStruct>} structs
           * @param {number} pos
           */
          const tryToMergeWithLeft = (structs, pos) => {
            const left = structs[pos - 1];
            const right = structs[pos];
            if (left.deleted === right.deleted && left.constructor === right.constructor) {
              if (left.mergeWith(right)) {
                structs.splice(pos, 1);
                if (right instanceof Item && right.parentSub !== null && right.parent._map.get(right.parentSub) === right) {
                  right.parent._map.set(right.parentSub, /** @type {Item} */ (left));
                }
              }
            }
          };
          // Replace deleted items with ItemDeleted / GC.
          // This is where content is actually remove from the Yjs Doc.
          if (doc.gc) {
            for (const [client, deleteItems] of ds.clients) {
              const structs = /** @type {Array<AbstractStruct>} */ (store.clients.get(client));
              for (let di = deleteItems.length - 1; di >= 0; di--) {
                const deleteItem = deleteItems[di];
                const endDeleteItemClock = deleteItem.clock + deleteItem.len;
                for (
                  let si = findIndexSS(structs, deleteItem.clock), struct = structs[si];
                  si < structs.length && struct.id.clock < endDeleteItemClock;
                  struct = structs[++si]
                ) {
                  const struct = structs[si];
                  if (deleteItem.clock + deleteItem.len <= struct.id.clock) {
                    break
                  }
                  if (struct instanceof Item && struct.deleted && !struct.keep) {
                    struct.gc(store, false);
                  }
                }
              }
            }
          }
          // try to merge deleted / gc'd items
          // merge from right to left for better efficiecy and so we don't miss any merge targets
          for (const [client, deleteItems] of ds.clients) {
            const structs = /** @type {Array<AbstractStruct>} */ (store.clients.get(client));
            for (let di = deleteItems.length - 1; di >= 0; di--) {
              const deleteItem = deleteItems[di];
              // start with merging the item next to the last deleted item
              const mostRightIndexToCheck = min(structs.length - 1, 1 + findIndexSS(structs, deleteItem.clock + deleteItem.len - 1));
              for (
                let si = mostRightIndexToCheck, struct = structs[si];
                si > 0 && struct.id.clock >= deleteItem.clock;
                struct = structs[--si]
              ) {
                tryToMergeWithLeft(structs, si);
              }
            }
          }

          // on all affected store.clients props, try to merge
          for (const [client, clock] of transaction.afterState) {
            const beforeClock = transaction.beforeState.get(client) || 0;
            if (beforeClock !== clock) {
              const structs = /** @type {Array<AbstractStruct>} */ (store.clients.get(client));
              // we iterate from right to left so we can safely remove entries
              const firstChangePos = max(findIndexSS(structs, beforeClock), 1);
              for (let i = structs.length - 1; i >= firstChangePos; i--) {
                tryToMergeWithLeft(structs, i);
              }
            }
          }
          // try to merge mergeStructs
          // @todo: it makes more sense to transform mergeStructs to a DS, sort it, and merge from right to left
          //        but at the moment DS does not handle duplicates
          for (const mid of transaction._mergeStructs) {
            const client = mid.client;
            const clock = mid.clock;
            const structs = /** @type {Array<AbstractStruct>} */ (store.clients.get(client));
            const replacedStructPos = findIndexSS(structs, clock);
            if (replacedStructPos + 1 < structs.length) {
              tryToMergeWithLeft(structs, replacedStructPos + 1);
            }
            if (replacedStructPos > 0) {
              tryToMergeWithLeft(structs, replacedStructPos);
            }
          }
          // @todo Merge all the transactions into one and provide send the data as a single update message
          doc.emit('afterTransactionCleanup', [transaction, doc]);
          if (doc._observers.has('update')) {
            const updateMessage = computeUpdateMessageFromTransaction(transaction);
            if (updateMessage !== null) {
              doc.emit('update', [toUint8Array(updateMessage), transaction.origin, doc]);
            }
          }
        }
        doc._transactionCleanups = [];
      }
    }
  };

  class StackItem {
    /**
     * @param {DeleteSet} ds
     * @param {number} start clock start of the local client
     * @param {number} len
     */
    constructor (ds, start, len) {
      this.ds = ds;
      this.start = start;
      this.len = len;
      /**
       * Use this to save and restore metadata like selection range
       */
      this.meta = new Map();
    }
  }

  /**
   * @param {UndoManager} undoManager
   * @param {Array<StackItem>} stack
   * @param {string} eventType
   * @return {StackItem?}
   */
  const popStackItem = (undoManager, stack, eventType) => {
    /**
     * Whether a change happened
     * @type {StackItem?}
     */
    let result = null;
    const doc = undoManager.doc;
    const scope = undoManager.scope;
    transact(doc, transaction => {
      while (stack.length > 0 && result === null) {
        const store = doc.store;
        const stackItem = /** @type {StackItem} */ (stack.pop());
        const itemsToRedo = new Set();
        let performedChange = false;
        iterateDeletedStructs(transaction, stackItem.ds, store, struct => {
          if (struct instanceof Item && scope.some(type => isParentOf(type, struct))) {
            itemsToRedo.add(struct);
          }
        });
        itemsToRedo.forEach(item => {
          performedChange = redoItem(transaction, item, itemsToRedo) !== null || performedChange;
        });
        const structs = /** @type {Array<GC|Item>} */ (store.clients.get(doc.clientID));
        iterateStructs(transaction, structs, stackItem.start, stackItem.len, struct => {
          if (struct instanceof Item && !struct.deleted && scope.some(type => isParentOf(type, /** @type {Item} */ (struct)))) {
            if (struct.redone !== null) {
              let { item, diff } = followRedone(store, struct.id);
              if (diff > 0) {
                item = getItemCleanStart(transaction, store, createID(item.id.client, item.id.clock + diff));
              }
              if (item.length > stackItem.len) {
                getItemCleanStart(transaction, store, createID(item.id.client, item.id.clock + stackItem.len));
              }
              struct = item;
            }
            keepItem(struct);
            struct.delete(transaction);
            performedChange = true;
          }
        });
        result = stackItem;
        if (result != null) {
          undoManager.emit('stack-item-popped', [{ stackItem: result, type: eventType }, undoManager]);
        }
      }
    }, undoManager);
    return result
  };

  /**
   * Fires 'stack-item-added' event when a stack item was added to either the undo- or
   * the redo-stack. You may store additional stack information via the
   * metadata property on `event.stackItem.metadata` (it is a `Map` of metadata properties).
   * Fires 'stack-item-popped' event when a stack item was popped from either the
   * undo- or the redo-stack. You may restore the saved stack information from `event.stackItem.metadata`.
   *
   * @extends {Observable<'stack-item-added'|'stack-item-popped'>}
   */
  class UndoManager extends Observable {
    /**
     * @param {AbstractType<any>|Array<AbstractType<any>>} typeScope Accepts either a single type, or an array of types
     * @param {Set<any>} [trackedTransactionOrigins=new Set([null])]
     * @param {object} [options={captureTimeout=500}]
     */
    constructor (typeScope, trackedTransactionOrigins = new Set([null]), { captureTimeout = 500 } = {}) {
      super();
      this.scope = typeScope instanceof Array ? typeScope : [typeScope];
      trackedTransactionOrigins.add(this);
      this.trackedTransactionOrigins = trackedTransactionOrigins;
      /**
       * @type {Array<StackItem>}
       */
      this.undoStack = [];
      /**
       * @type {Array<StackItem>}
       */
      this.redoStack = [];
      /**
       * Whether the client is currently undoing (calling UndoManager.undo)
       *
       * @type {boolean}
       */
      this.undoing = false;
      this.redoing = false;
      this.doc = /** @type {Doc} */ (this.scope[0].doc);
      this.lastChange = 0;
      this.doc.on('afterTransaction', /** @param {Transaction} transaction */ transaction => {
        // Only track certain transactions
        if (!this.scope.some(type => transaction.changedParentTypes.has(type)) || (!this.trackedTransactionOrigins.has(transaction.origin) && (!transaction.origin || !this.trackedTransactionOrigins.has(transaction.origin.constructor)))) {
          return
        }
        const undoing = this.undoing;
        const redoing = this.redoing;
        const stack = undoing ? this.redoStack : this.undoStack;
        if (undoing) {
          this.stopCapturing(); // next undo should not be appended to last stack item
        } else if (!redoing) {
          // neither undoing nor redoing: delete redoStack
          this.redoStack = [];
        }
        const beforeState = transaction.beforeState.get(this.doc.clientID) || 0;
        const afterState = transaction.afterState.get(this.doc.clientID) || 0;
        const now = getUnixTime();
        if (now - this.lastChange < captureTimeout && stack.length > 0 && !undoing && !redoing) {
          // append change to last stack op
          const lastOp = stack[stack.length - 1];
          lastOp.ds = mergeDeleteSets(lastOp.ds, transaction.deleteSet);
          lastOp.len = afterState - lastOp.start;
        } else {
          // create a new stack op
          stack.push(new StackItem(transaction.deleteSet, beforeState, afterState - beforeState));
        }
        if (!undoing && !redoing) {
          this.lastChange = now;
        }
        // make sure that deleted structs are not gc'd
        iterateDeletedStructs(transaction, transaction.deleteSet, transaction.doc.store, /** @param {Item|GC} item */ item => {
          if (item instanceof Item && this.scope.some(type => isParentOf(type, item))) {
            keepItem(item);
          }
        });
        this.emit('stack-item-added', [{ stackItem: stack[stack.length - 1], origin: transaction.origin, type: undoing ? 'redo' : 'undo' }, this]);
      });
    }

    /**
     * UndoManager merges Undo-StackItem if they are created within time-gap
     * smaller than `options.captureTimeout`. Call `um.stopCapturing()` so that the next
     * StackItem won't be merged.
     *
     *
     * @example
     *     // without stopCapturing
     *     ytext.insert(0, 'a')
     *     ytext.insert(1, 'b')
     *     um.undo()
     *     ytext.toString() // => '' (note that 'ab' was removed)
     *     // with stopCapturing
     *     ytext.insert(0, 'a')
     *     um.stopCapturing()
     *     ytext.insert(0, 'b')
     *     um.undo()
     *     ytext.toString() // => 'a' (note that only 'b' was removed)
     *
     */
    stopCapturing () {
      this.lastChange = 0;
    }

    /**
     * Undo last changes on type.
     *
     * @return {StackItem?} Returns StackItem if a change was applied
     */
    undo () {
      this.undoing = true;
      let res;
      try {
        res = popStackItem(this, this.undoStack, 'undo');
      } finally {
        this.undoing = false;
      }
      return res
    }

    /**
     * Redo last undo operation.
     *
     * @return {StackItem?} Returns StackItem if a change was applied
     */
    redo () {
      this.redoing = true;
      let res;
      try {
        res = popStackItem(this, this.redoStack, 'redo');
      } finally {
        this.redoing = false;
      }
      return res
    }
  }

  /**
   * @module Y
   */

  /**
   * A Yjs instance handles the state of shared data.
   * @extends Observable<string>
   */
  class Doc extends Observable {
    /**
     * @param {Object|undefined} conf configuration
     */
    constructor (conf = {}) {
      super();
      this.gc = conf.gc || true;
      this.clientID = uint32();
      /**
       * @type {Map<string, AbstractType<YEvent>>}
       */
      this.share = new Map();
      this.store = new StructStore();
      /**
       * @type {Transaction | null}
       * @private
       */
      this._transaction = null;
      /**
       * @type {Array<Transaction>}
       * @private
       */
      this._transactionCleanups = [];
    }
    /**
     * Changes that happen inside of a transaction are bundled. This means that
     * the observer fires _after_ the transaction is finished and that all changes
     * that happened inside of the transaction are sent as one message to the
     * other peers.
     *
     * @param {function(Transaction):void} f The function that should be executed as a transaction
     * @param {any} [origin] Origin of who started the transaction. Will be stored on transaction.origin
     *
     * @public
     */
    transact (f, origin = null) {
      transact(this, f, origin);
    }
    /**
     * Define a shared data type.
     *
     * Multiple calls of `y.get(name, TypeConstructor)` yield the same result
     * and do not overwrite each other. I.e.
     * `y.define(name, Y.Array) === y.define(name, Y.Array)`
     *
     * After this method is called, the type is also available on `y.share.get(name)`.
     *
     * *Best Practices:*
     * Define all types right after the Yjs instance is created and store them in a separate object.
     * Also use the typed methods `getText(name)`, `getArray(name)`, ..
     *
     * @example
     *   const y = new Y(..)
     *   const appState = {
     *     document: y.getText('document')
     *     comments: y.getArray('comments')
     *   }
     *
     * @param {string} name
     * @param {Function} TypeConstructor The constructor of the type definition. E.g. Y.Text, Y.Array, Y.Map, ...
     * @return {AbstractType<any>} The created type. Constructed with TypeConstructor
     *
     * @public
     */
    get (name, TypeConstructor = AbstractType) {
      const type = setIfUndefined(this.share, name, () => {
        // @ts-ignore
        const t = new TypeConstructor();
        t._integrate(this, null);
        return t
      });
      const Constr = type.constructor;
      if (TypeConstructor !== AbstractType && Constr !== TypeConstructor) {
        if (Constr === AbstractType) {
          // @ts-ignore
          const t = new TypeConstructor();
          t._map = type._map;
          type._map.forEach(/** @param {Item?} n */ n => {
            for (; n !== null; n = n.left) {
              n.parent = t;
            }
          });
          t._start = type._start;
          for (let n = t._start; n !== null; n = n.right) {
            n.parent = t;
          }
          t._length = type._length;
          this.share.set(name, t);
          t._integrate(this, null);
          return t
        } else {
          throw new Error(`Type with the name ${name} has already been defined with a different constructor`)
        }
      }
      return type
    }
    /**
     * @template T
     * @param {string} name
     * @return {YArray<T>}
     *
     * @public
     */
    getArray (name) {
      // @ts-ignore
      return this.get(name, YArray)
    }
    /**
     * @param {string} name
     * @return {YText}
     *
     * @public
     */
    getText (name) {
      // @ts-ignore
      return this.get(name, YText)
    }
    /**
     * @param {string} name
     * @return {YMap<any>}
     *
     * @public
     */
    getMap (name) {
      // @ts-ignore
      return this.get(name, YMap)
    }
    /**
     * @param {string} name
     * @return {YXmlFragment}
     *
     * @public
     */
    getXmlFragment (name) {
      // @ts-ignore
      return this.get(name, YXmlFragment)
    }
    /**
     * Emit `destroy` event and unregister all event handlers.
     *
     * @protected
     */
    destroy () {
      this.emit('destroyed', [true]);
      super.destroy();
    }
    /**
     * @param {string} eventName
     * @param {function} f
     */
    on (eventName, f) {
      super.on(eventName, f);
    }
    /**
     * @param {string} eventName
     * @param {function} f
     */
    off (eventName, f) {
      super.off(eventName, f);
    }
  }

  /**
   * YEvent describes the changes on a YType.
   */
  class YEvent {
    /**
     * @param {AbstractType<any>} target The changed type.
     * @param {Transaction} transaction
     */
    constructor (target, transaction) {
      /**
       * The type on which this event was created on.
       * @type {AbstractType<any>}
       */
      this.target = target;
      /**
       * The current target on which the observe callback is called.
       * @type {AbstractType<any>}
       */
      this.currentTarget = target;
      /**
       * The transaction that triggered this event.
       * @type {Transaction}
       */
      this.transaction = transaction;
    }

    /**
     * Computes the path from `y` to the changed type.
     *
     * The following property holds:
     * @example
     *   let type = y
     *   event.path.forEach(dir => {
     *     type = type.get(dir)
     *   })
     *   type === event.target // => true
     */
    get path () {
      // @ts-ignore _item is defined because target is integrated
      return getPathTo(this.currentTarget, this.target)
    }

    /**
     * Check if a struct is deleted by this event.
     *
     * @param {AbstractStruct} struct
     * @return {boolean}
     */
    deletes (struct) {
      return isDeleted(this.transaction.deleteSet, struct.id)
    }

    /**
     * Check if a struct is added by this event.
     *
     * @param {AbstractStruct} struct
     * @return {boolean}
     */
    adds (struct) {
      return struct.id.clock >= (this.transaction.beforeState.get(struct.id.client) || 0)
    }
  }

  /**
   * Compute the path from this type to the specified target.
   *
   * @example
   *   // `child` should be accessible via `type.get(path[0]).get(path[1])..`
   *   const path = type.getPathTo(child)
   *   // assuming `type instanceof YArray`
   *   console.log(path) // might look like => [2, 'key1']
   *   child === type.get(path[0]).get(path[1])
   *
   * @param {AbstractType<any>} parent
   * @param {AbstractType<any>} child target
   * @return {Array<string|number>} Path to the target
   *
   * @private
   * @function
   */
  const getPathTo = (parent, child) => {
    const path = [];
    while (child._item !== null && child !== parent) {
      if (child._item.parentSub !== null) {
        // parent is map-ish
        path.unshift(child._item.parentSub);
      } else {
        // parent is array-ish
        let i = 0;
        let c = child._item.parent._start;
        while (c !== child._item && c !== null) {
          if (!c.deleted) {
            i++;
          }
          c = c.right;
        }
        path.unshift(i);
      }
      child = child._item.parent;
    }
    return path
  };

  /**
   * Call event listeners with an event. This will also add an event to all
   * parents (for `.observeDeep` handlers).
   * @private
   *
   * @template EventType
   * @param {AbstractType<EventType>} type
   * @param {Transaction} transaction
   * @param {EventType} event
   */
  const callTypeObservers = (type, transaction, event) => {
    callEventHandlerListeners(type._eH, event, transaction);
    const changedParentTypes = transaction.changedParentTypes;
    while (true) {
      // @ts-ignore
      setIfUndefined(changedParentTypes, type, () => []).push(event);
      if (type._item === null) {
        break
      }
      type = type._item.parent;
    }
  };

  /**
   * @template EventType
   * Abstract Yjs Type class
   */
  class AbstractType {
    constructor () {
      /**
       * @type {Item|null}
       */
      this._item = null;
      /**
       * @private
       * @type {Map<string,Item>}
       */
      this._map = new Map();
      /**
       * @private
       * @type {Item|null}
       */
      this._start = null;
      /**
       * @private
       * @type {Doc|null}
       */
      this.doc = null;
      this._length = 0;
      /**
       * Event handlers
       * @type {EventHandler<EventType,Transaction>}
       */
      this._eH = createEventHandler();
      /**
       * Deep event handlers
       * @type {EventHandler<Array<YEvent>,Transaction>}
       */
      this._dEH = createEventHandler();
    }

    /**
     * Integrate this type into the Yjs instance.
     *
     * * Save this struct in the os
     * * This type is sent to other client
     * * Observer functions are fired
     *
     * @param {Doc} y The Yjs instance
     * @param {Item|null} item
     * @private
     */
    _integrate (y, item) {
      this.doc = y;
      this._item = item;
    }

    /**
     * @return {AbstractType<EventType>}
     * @private
     */
    _copy () {
      throw methodUnimplemented()
    }

    /**
     * @param {encoding.Encoder} encoder
     * @private
     */
    _write (encoder) { }

    /**
     * The first non-deleted item
     */
    get _first () {
      let n = this._start;
      while (n !== null && n.deleted) {
        n = n.right;
      }
      return n
    }

    /**
     * Creates YEvent and calls all type observers.
     * Must be implemented by each type.
     *
     * @param {Transaction} transaction
     * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
     *
     * @private
     */
    _callObserver (transaction, parentSubs) { /* skip if no type is specified */ }

    /**
     * Observe all events that are created on this type.
     *
     * @param {function(EventType, Transaction):void} f Observer function
     */
    observe (f) {
      addEventHandlerListener(this._eH, f);
    }

    /**
     * Observe all events that are created by this type and its children.
     *
     * @param {function(Array<YEvent>,Transaction):void} f Observer function
     */
    observeDeep (f) {
      addEventHandlerListener(this._dEH, f);
    }

    /**
     * Unregister an observer function.
     *
     * @param {function(EventType,Transaction):void} f Observer function
     */
    unobserve (f) {
      removeEventHandlerListener(this._eH, f);
    }

    /**
     * Unregister an observer function.
     *
     * @param {function(Array<YEvent>,Transaction):void} f Observer function
     */
    unobserveDeep (f) {
      removeEventHandlerListener(this._dEH, f);
    }

    /**
     * @abstract
     * @return {Object | Array | number | string}
     */
    toJSON () {}
  }

  /**
   * @param {AbstractType<any>} type
   * @return {Array<any>}
   *
   * @private
   * @function
   */
  const typeListToArray = type => {
    const cs = [];
    let n = type._start;
    while (n !== null) {
      if (n.countable && !n.deleted) {
        const c = n.content.getContent();
        for (let i = 0; i < c.length; i++) {
          cs.push(c[i]);
        }
      }
      n = n.right;
    }
    return cs
  };

  /**
   * @param {AbstractType<any>} type
   * @param {Snapshot} snapshot
   * @return {Array<any>}
   *
   * @private
   * @function
   */
  const typeListToArraySnapshot = (type, snapshot) => {
    const cs = [];
    let n = type._start;
    while (n !== null) {
      if (n.countable && isVisible(n, snapshot)) {
        const c = n.content.getContent();
        for (let i = 0; i < c.length; i++) {
          cs.push(c[i]);
        }
      }
      n = n.right;
    }
    return cs
  };

  /**
   * Executes a provided function on once on overy element of this YArray.
   *
   * @param {AbstractType<any>} type
   * @param {function(any,number,any):void} f A function to execute on every element of this YArray.
   *
   * @private
   * @function
   */
  const typeListForEach = (type, f) => {
    let index = 0;
    let n = type._start;
    while (n !== null) {
      if (n.countable && !n.deleted) {
        const c = n.content.getContent();
        for (let i = 0; i < c.length; i++) {
          f(c[i], index++, type);
        }
      }
      n = n.right;
    }
  };

  /**
   * @template C,R
   * @param {AbstractType<any>} type
   * @param {function(C,number,AbstractType<any>):R} f
   * @return {Array<R>}
   *
   * @private
   * @function
   */
  const typeListMap = (type, f) => {
    /**
     * @type {Array<any>}
     */
    const result = [];
    typeListForEach(type, (c, i) => {
      result.push(f(c, i, type));
    });
    return result
  };

  /**
   * @param {AbstractType<any>} type
   * @return {IterableIterator<any>}
   *
   * @private
   * @function
   */
  const typeListCreateIterator = type => {
    let n = type._start;
    /**
     * @type {Array<any>|null}
     */
    let currentContent = null;
    let currentContentIndex = 0;
    return {
      [Symbol.iterator] () {
        return this
      },
      next: () => {
        // find some content
        if (currentContent === null) {
          while (n !== null && n.deleted) {
            n = n.right;
          }
          // check if we reached the end, no need to check currentContent, because it does not exist
          if (n === null) {
            return {
              done: true,
              value: undefined
            }
          }
          // we found n, so we can set currentContent
          currentContent = n.content.getContent();
          currentContentIndex = 0;
          n = n.right; // we used the content of n, now iterate to next
        }
        const value = currentContent[currentContentIndex++];
        // check if we need to empty currentContent
        if (currentContent.length <= currentContentIndex) {
          currentContent = null;
        }
        return {
          done: false,
          value
        }
      }
    }
  };

  /**
   * @param {AbstractType<any>} type
   * @param {number} index
   * @return {any}
   *
   * @private
   * @function
   */
  const typeListGet = (type, index) => {
    for (let n = type._start; n !== null; n = n.right) {
      if (!n.deleted && n.countable) {
        if (index < n.length) {
          return n.content.getContent()[index]
        }
        index -= n.length;
      }
    }
  };

  /**
   * @param {Transaction} transaction
   * @param {AbstractType<any>} parent
   * @param {Item?} referenceItem
   * @param {Array<Object<string,any>|Array<any>|boolean|number|string|Uint8Array>} content
   *
   * @private
   * @function
   */
  const typeListInsertGenericsAfter = (transaction, parent, referenceItem, content) => {
    let left = referenceItem;
    const right = referenceItem === null ? parent._start : referenceItem.right;
    /**
     * @type {Array<Object|Array|number>}
     */
    let jsonContent = [];
    const packJsonContent = () => {
      if (jsonContent.length > 0) {
        left = new Item(nextID(transaction), left, left === null ? null : left.lastId, right, right === null ? null : right.id, parent, null, new ContentJSON(jsonContent));
        left.integrate(transaction);
        jsonContent = [];
      }
    };
    content.forEach(c => {
      switch (c.constructor) {
        case Number:
        case Object:
        case Boolean:
        case Array:
        case String:
          jsonContent.push(c);
          break
        default:
          packJsonContent();
          switch (c.constructor) {
            case Uint8Array:
            case ArrayBuffer:
              left = new Item(nextID(transaction), left, left === null ? null : left.lastId, right, right === null ? null : right.id, parent, null, new ContentBinary(new Uint8Array(/** @type {Uint8Array} */ (c))));
              left.integrate(transaction);
              break
            default:
              if (c instanceof AbstractType) {
                left = new Item(nextID(transaction), left, left === null ? null : left.lastId, right, right === null ? null : right.id, parent, null, new ContentType(c));
                left.integrate(transaction);
              } else {
                throw new Error('Unexpected content type in insert operation')
              }
          }
      }
    });
    packJsonContent();
  };

  /**
   * @param {Transaction} transaction
   * @param {AbstractType<any>} parent
   * @param {number} index
   * @param {Array<Object<string,any>|Array<any>|number|string|Uint8Array>} content
   *
   * @private
   * @function
   */
  const typeListInsertGenerics = (transaction, parent, index, content) => {
    if (index === 0) {
      return typeListInsertGenericsAfter(transaction, parent, null, content)
    }
    let n = parent._start;
    for (; n !== null; n = n.right) {
      if (!n.deleted && n.countable) {
        if (index <= n.length) {
          if (index < n.length) {
            // insert in-between
            getItemCleanStart(transaction, transaction.doc.store, createID(n.id.client, n.id.clock + index));
          }
          break
        }
        index -= n.length;
      }
    }
    return typeListInsertGenericsAfter(transaction, parent, n, content)
  };

  /**
   * @param {Transaction} transaction
   * @param {AbstractType<any>} parent
   * @param {number} index
   * @param {number} length
   *
   * @private
   * @function
   */
  const typeListDelete = (transaction, parent, index, length) => {
    if (length === 0) { return }
    let n = parent._start;
    // compute the first item to be deleted
    for (; n !== null && index > 0; n = n.right) {
      if (!n.deleted && n.countable) {
        if (index < n.length) {
          getItemCleanStart(transaction, transaction.doc.store, createID(n.id.client, n.id.clock + index));
        }
        index -= n.length;
      }
    }
    // delete all items until done
    while (length > 0 && n !== null) {
      if (!n.deleted) {
        if (length < n.length) {
          getItemCleanStart(transaction, transaction.doc.store, createID(n.id.client, n.id.clock + length));
        }
        n.delete(transaction);
        length -= n.length;
      }
      n = n.right;
    }
    if (length > 0) {
      throw create$1('array length exceeded')
    }
  };

  /**
   * @param {Transaction} transaction
   * @param {AbstractType<any>} parent
   * @param {string} key
   *
   * @private
   * @function
   */
  const typeMapDelete = (transaction, parent, key) => {
    const c = parent._map.get(key);
    if (c !== undefined) {
      c.delete(transaction);
    }
  };

  /**
   * @param {Transaction} transaction
   * @param {AbstractType<any>} parent
   * @param {string} key
   * @param {Object|number|Array<any>|string|Uint8Array|AbstractType<any>} value
   *
   * @private
   * @function
   */
  const typeMapSet = (transaction, parent, key, value) => {
    const left = parent._map.get(key) || null;
    let content;
    if (value == null) {
      content = new ContentJSON([value]);
    } else {
      switch (value.constructor) {
        case Number:
        case Object:
        case Boolean:
        case Array:
        case String:
          content = new ContentJSON([value]);
          break
        case Uint8Array:
          content = new ContentBinary(value);
          break
        default:
          if (value instanceof AbstractType) {
            content = new ContentType(value);
          } else {
            throw new Error('Unexpected content type')
          }
      }
    }
    new Item(nextID(transaction), left, left === null ? null : left.lastId, null, null, parent, key, content).integrate(transaction);
  };

  /**
   * @param {AbstractType<any>} parent
   * @param {string} key
   * @return {Object<string,any>|number|Array<any>|string|Uint8Array|AbstractType<any>|undefined}
   *
   * @private
   * @function
   */
  const typeMapGet = (parent, key) => {
    const val = parent._map.get(key);
    return val !== undefined && !val.deleted ? val.content.getContent()[val.length - 1] : undefined
  };

  /**
   * @param {AbstractType<any>} parent
   * @return {Object<string,Object<string,any>|number|Array<any>|string|Uint8Array|AbstractType<any>|undefined>}
   *
   * @private
   * @function
   */
  const typeMapGetAll = (parent) => {
    /**
     * @type {Object<string,any>}
     */
    let res = {};
    for (const [key, value] of parent._map) {
      if (!value.deleted) {
        res[key] = value.content.getContent()[value.length - 1];
      }
    }
    return res
  };

  /**
   * @param {AbstractType<any>} parent
   * @param {string} key
   * @return {boolean}
   *
   * @private
   * @function
   */
  const typeMapHas = (parent, key) => {
    const val = parent._map.get(key);
    return val !== undefined && !val.deleted
  };

  /**
   * @param {Map<string,Item>} map
   * @return {IterableIterator<Array<any>>}
   *
   * @private
   * @function
   */
  const createMapIterator = map => iteratorFilter(map.entries(), /** @param {any} entry */ entry => !entry[1].deleted);

  /**
   * @module YArray
   */

  /**
   * Event that describes the changes on a YArray
   * @template T
   */
  class YArrayEvent extends YEvent {
    /**
     * @param {YArray<T>} yarray The changed type
     * @param {Transaction} transaction The transaction object
     */
    constructor (yarray, transaction) {
      super(yarray, transaction);
      this._transaction = transaction;
    }
  }

  /**
   * A shared Array implementation.
   * @template T
   * @extends AbstractType<YArrayEvent<T>>
   * @implements {IterableIterator<T>}
   */
  class YArray extends AbstractType {
    constructor () {
      super();
      /**
       * @type {Array<any>?}
       * @private
       */
      this._prelimContent = [];
    }
    /**
     * Integrate this type into the Yjs instance.
     *
     * * Save this struct in the os
     * * This type is sent to other client
     * * Observer functions are fired
     *
     * @param {Doc} y The Yjs instance
     * @param {Item} item
     *
     * @private
     */
    _integrate (y, item) {
      super._integrate(y, item);
      this.insert(0, /** @type {Array} */ (this._prelimContent));
      this._prelimContent = null;
    }

    _copy () {
      return new YArray()
    }

    get length () {
      return this._prelimContent === null ? this._length : this._prelimContent.length
    }
    /**
     * Creates YArrayEvent and calls observers.
     *
     * @param {Transaction} transaction
     * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
     *
     * @private
     */
    _callObserver (transaction, parentSubs) {
      callTypeObservers(this, transaction, new YArrayEvent(this, transaction));
    }

    /**
     * Inserts new content at an index.
     *
     * Important: This function expects an array of content. Not just a content
     * object. The reason for this "weirdness" is that inserting several elements
     * is very efficient when it is done as a single operation.
     *
     * @example
     *  // Insert character 'a' at position 0
     *  yarray.insert(0, ['a'])
     *  // Insert numbers 1, 2 at position 1
     *  yarray.insert(1, [1, 2])
     *
     * @param {number} index The index to insert content at.
     * @param {Array<T>} content The array of content
     */
    insert (index, content) {
      if (this.doc !== null) {
        transact(this.doc, transaction => {
          typeListInsertGenerics(transaction, this, index, content);
        });
      } else {
        /** @type {Array} */ (this._prelimContent).splice(index, 0, ...content);
      }
    }

    /**
     * Appends content to this YArray.
     *
     * @param {Array<T>} content Array of content to append.
     */
    push (content) {
      this.insert(this.length, content);
    }

    /**
     * Deletes elements starting from an index.
     *
     * @param {number} index Index at which to start deleting elements
     * @param {number} length The number of elements to remove. Defaults to 1.
     */
    delete (index, length = 1) {
      if (this.doc !== null) {
        transact(this.doc, transaction => {
          typeListDelete(transaction, this, index, length);
        });
      } else {
        /** @type {Array} */ (this._prelimContent).splice(index, length);
      }
    }

    /**
     * Returns the i-th element from a YArray.
     *
     * @param {number} index The index of the element to return from the YArray
     * @return {T}
     */
    get (index) {
      return typeListGet(this, index)
    }

    /**
     * Transforms this YArray to a JavaScript Array.
     *
     * @return {Array<T>}
     */
    toArray () {
      return typeListToArray(this)
    }

    /**
     * Transforms this Shared Type to a JSON object.
     *
     * @return {Array<any>}
     */
    toJSON () {
      return this.map(c => c instanceof AbstractType ? c.toJSON() : c)
    }

    /**
     * Returns an Array with the result of calling a provided function on every
     * element of this YArray.
     *
     * @template T,M
     * @param {function(T,number,YArray<T>):M} f Function that produces an element of the new Array
     * @return {Array<M>} A new array with each element being the result of the
     *                 callback function
     */
    map (f) {
      return typeListMap(this, /** @type {any} */ (f))
    }

    /**
     * Executes a provided function on once on overy element of this YArray.
     *
     * @param {function(T,number,YArray<T>):void} f A function to execute on every element of this YArray.
     */
    forEach (f) {
      typeListForEach(this, f);
    }

    /**
     * @return {IterableIterator<T>}
     */
    [Symbol.iterator] () {
      return typeListCreateIterator(this)
    }

    /**
     * @param {encoding.Encoder} encoder
     * @private
     */
    _write (encoder) {
      writeVarUint(encoder, YArrayRefID);
    }
  }

  /**
   * @param {decoding.Decoder} decoder
   *
   * @private
   * @function
   */
  const readYArray = decoder => new YArray();

  /**
   * @template T
   * Event that describes the changes on a YMap.
   */
  class YMapEvent extends YEvent {
    /**
     * @param {YMap<T>} ymap The YArray that changed.
     * @param {Transaction} transaction
     * @param {Set<any>} subs The keys that changed.
     */
    constructor (ymap, transaction, subs) {
      super(ymap, transaction);
      this.keysChanged = subs;
    }
  }

  /**
   * @template T number|string|Object|Array|Uint8Array
   * A shared Map implementation.
   *
   * @extends AbstractType<YMapEvent<T>>
   * @implements {IterableIterator}
   */
  class YMap extends AbstractType {
    constructor () {
      super();
      /**
       * @type {Map<string,any>?}
       * @private
       */
      this._prelimContent = new Map();
    }
    /**
     * Integrate this type into the Yjs instance.
     *
     * * Save this struct in the os
     * * This type is sent to other client
     * * Observer functions are fired
     *
     * @param {Doc} y The Yjs instance
     * @param {Item} item
     *
     * @private
     */
    _integrate (y, item) {
      super._integrate(y, item);
      for (let [key, value] of /** @type {Map<string, any>} */ (this._prelimContent)) {
        this.set(key, value);
      }
      this._prelimContent = null;
    }

    _copy () {
      return new YMap()
    }

    /**
     * Creates YMapEvent and calls observers.
     *
     * @param {Transaction} transaction
     * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
     *
     * @private
     */
    _callObserver (transaction, parentSubs) {
      callTypeObservers(this, transaction, new YMapEvent(this, transaction, parentSubs));
    }

    /**
     * Transforms this Shared Type to a JSON object.
     *
     * @return {Object<string,T>}
     */
    toJSON () {
      /**
       * @type {Object<string,T>}
       */
      const map = {};
      for (let [key, item] of this._map) {
        if (!item.deleted) {
          const v = item.content.getContent()[item.length - 1];
          map[key] = v instanceof AbstractType ? v.toJSON() : v;
        }
      }
      return map
    }

    /**
     * Returns the keys for each element in the YMap Type.
     *
     * @return {IterableIterator<string>}
     */
    keys () {
      return iteratorMap(createMapIterator(this._map), /** @param {any} v */ v => v[0])
    }

    /**
     * Returns the keys for each element in the YMap Type.
     *
     * @return {IterableIterator<string>}
     */
    values () {
      return iteratorMap(createMapIterator(this._map), /** @param {any} v */ v => v[1].content.getContent()[v[1].length - 1])
    }

    /**
     * Returns an Iterator of [key, value] pairs
     *
     * @return {IterableIterator<any>}
     */
    entries () {
      return iteratorMap(createMapIterator(this._map), /** @param {any} v */ v => [v[0], v[1].content.getContent()[v[1].length - 1]])
    }

    /**
     * Executes a provided function on once on overy key-value pair.
     *
     * @param {function(T,string,YMap<T>):void} f A function to execute on every element of this YArray.
     */
    forEach (f) {
      /**
       * @type {Object<string,T>}
       */
      const map = {};
      for (let [key, item] of this._map) {
        if (!item.deleted) {
          f(item.content.getContent()[item.length - 1], key, this);
        }
      }
      return map
    }

    /**
     * @return {IterableIterator<T>}
     */
    [Symbol.iterator] () {
      return this.entries()
    }

    /**
     * Remove a specified element from this YMap.
     *
     * @param {string} key The key of the element to remove.
     */
    delete (key) {
      if (this.doc !== null) {
        transact(this.doc, transaction => {
          typeMapDelete(transaction, this, key);
        });
      } else {
        /** @type {Map<string, any>} */ (this._prelimContent).delete(key);
      }
    }

    /**
     * Adds or updates an element with a specified key and value.
     *
     * @param {string} key The key of the element to add to this YMap
     * @param {T} value The value of the element to add
     */
    set (key, value) {
      if (this.doc !== null) {
        transact(this.doc, transaction => {
          typeMapSet(transaction, this, key, value);
        });
      } else {
        /** @type {Map<string, any>} */ (this._prelimContent).set(key, value);
      }
      return value
    }

    /**
     * Returns a specified element from this YMap.
     *
     * @param {string} key
     * @return {T|undefined}
     */
    get (key) {
      return /** @type {any} */ (typeMapGet(this, key))
    }

    /**
     * Returns a boolean indicating whether the specified key exists or not.
     *
     * @param {string} key The key to test.
     * @return {boolean}
     */
    has (key) {
      return typeMapHas(this, key)
    }

    /**
     * @param {encoding.Encoder} encoder
     *
     * @private
     */
    _write (encoder) {
      writeVarUint(encoder, YMapRefID);
    }
  }

  /**
   * @param {decoding.Decoder} decoder
   *
   * @private
   * @function
   */
  const readYMap = decoder => new YMap();

  class ItemListPosition {
    /**
     * @param {Item|null} left
     * @param {Item|null} right
     */
    constructor (left, right) {
      this.left = left;
      this.right = right;
    }
  }

  class ItemTextListPosition extends ItemListPosition {
    /**
     * @param {Item|null} left
     * @param {Item|null} right
     * @param {Map<string,any>} currentAttributes
     */
    constructor (left, right, currentAttributes) {
      super(left, right);
      this.currentAttributes = currentAttributes;
    }
  }

  class ItemInsertionResult extends ItemListPosition {
    /**
     * @param {Item|null} left
     * @param {Item|null} right
     * @param {Map<string,any>} negatedAttributes
     */
    constructor (left, right, negatedAttributes) {
      super(left, right);
      this.negatedAttributes = negatedAttributes;
    }
  }

  /**
   * @param {Transaction} transaction
   * @param {StructStore} store
   * @param {Map<string,any>} currentAttributes
   * @param {Item|null} left
   * @param {Item|null} right
   * @param {number} count
   * @return {ItemTextListPosition}
   *
   * @private
   * @function
   */
  const findNextPosition = (transaction, store, currentAttributes, left, right, count) => {
    while (right !== null && count > 0) {
      switch (right.content.constructor) {
        case ContentEmbed:
        case ContentString:
          if (!right.deleted) {
            if (count < right.length) {
              // split right
              getItemCleanStart(transaction, store, createID(right.id.client, right.id.clock + count));
            }
            count -= right.length;
          }
          break
        case ContentFormat:
          if (!right.deleted) {
            updateCurrentAttributes(currentAttributes, /** @type {ContentFormat} */ (right.content));
          }
          break
      }
      left = right;
      right = right.right;
    }
    return new ItemTextListPosition(left, right, currentAttributes)
  };

  /**
   * @param {Transaction} transaction
   * @param {StructStore} store
   * @param {AbstractType<any>} parent
   * @param {number} index
   * @return {ItemTextListPosition}
   *
   * @private
   * @function
   */
  const findPosition = (transaction, store, parent, index) => {
    let currentAttributes = new Map();
    let left = null;
    let right = parent._start;
    return findNextPosition(transaction, store, currentAttributes, left, right, index)
  };

  /**
   * Negate applied formats
   *
   * @param {Transaction} transaction
   * @param {AbstractType<any>} parent
   * @param {Item|null} left
   * @param {Item|null} right
   * @param {Map<string,any>} negatedAttributes
   * @return {ItemListPosition}
   *
   * @private
   * @function
   */
  const insertNegatedAttributes = (transaction, parent, left, right, negatedAttributes) => {
    // check if we really need to remove attributes
    while (
      right !== null && (
        right.deleted === true || (
          right.content.constructor === ContentFormat &&
          (negatedAttributes.get(/** @type {ContentFormat} */ (right.content).key) === /** @type {ContentFormat} */ (right.content).value)
        )
      )
    ) {
      if (!right.deleted) {
        negatedAttributes.delete(/** @type {ContentFormat} */ (right.content).key);
      }
      left = right;
      right = right.right;
    }
    for (let [key, val] of negatedAttributes) {
      left = new Item(nextID(transaction), left, left === null ? null : left.lastId, right, right === null ? null : right.id, parent, null, new ContentFormat(key, val));
      left.integrate(transaction);
    }
    return { left, right }
  };

  /**
   * @param {Map<string,any>} currentAttributes
   * @param {ContentFormat} format
   *
   * @private
   * @function
   */
  const updateCurrentAttributes = (currentAttributes, format) => {
    const { key, value } = format;
    if (value === null) {
      currentAttributes.delete(key);
    } else {
      currentAttributes.set(key, value);
    }
  };

  /**
   * @param {Item|null} left
   * @param {Item|null} right
   * @param {Map<string,any>} currentAttributes
   * @param {Object<string,any>} attributes
   * @return {ItemListPosition}
   *
   * @private
   * @function
   */
  const minimizeAttributeChanges = (left, right, currentAttributes, attributes) => {
    // go right while attributes[right.key] === right.value (or right is deleted)
    while (true) {
      if (right === null) {
        break
      } else if (right.deleted) ; else if (right.content.constructor === ContentFormat && (attributes[(/** @type {ContentFormat} */ (right.content)).key] || null) === /** @type {ContentFormat} */ (right.content).value) {
        // found a format, update currentAttributes and continue
        updateCurrentAttributes(currentAttributes, /** @type {ContentFormat} */ (right.content));
      } else {
        break
      }
      left = right;
      right = right.right;
    }
    return new ItemListPosition(left, right)
  };

  /**
   * @param {Transaction} transaction
   * @param {AbstractType<any>} parent
   * @param {Item|null} left
   * @param {Item|null} right
   * @param {Map<string,any>} currentAttributes
   * @param {Object<string,any>} attributes
   * @return {ItemInsertionResult}
   *
   * @private
   * @function
   **/
  const insertAttributes = (transaction, parent, left, right, currentAttributes, attributes) => {
    const negatedAttributes = new Map();
    // insert format-start items
    for (let key in attributes) {
      const val = attributes[key];
      const currentVal = currentAttributes.get(key) || null;
      if (currentVal !== val) {
        // save negated attribute (set null if currentVal undefined)
        negatedAttributes.set(key, currentVal);
        left = new Item(nextID(transaction), left, left === null ? null : left.lastId, right, right === null ? null : right.id, parent, null, new ContentFormat(key, val));
        left.integrate(transaction);
      }
    }
    return new ItemInsertionResult(left, right, negatedAttributes)
  };

  /**
   * @param {Transaction} transaction
   * @param {AbstractType<any>} parent
   * @param {Item|null} left
   * @param {Item|null} right
   * @param {Map<string,any>} currentAttributes
   * @param {string|object} text
   * @param {Object<string,any>} attributes
   * @return {ItemListPosition}
   *
   * @private
   * @function
   **/
  const insertText = (transaction, parent, left, right, currentAttributes, text, attributes) => {
    for (let [key] of currentAttributes) {
      if (attributes[key] === undefined) {
        attributes[key] = null;
      }
    }
    const minPos = minimizeAttributeChanges(left, right, currentAttributes, attributes);
    const insertPos = insertAttributes(transaction, parent, minPos.left, minPos.right, currentAttributes, attributes);
    left = insertPos.left;
    right = insertPos.right;
    // insert content
    const content = text.constructor === String ? new ContentString(text) : new ContentEmbed(text);
    left = new Item(nextID(transaction), left, left === null ? null : left.lastId, right, right === null ? null : right.id, parent, null, content);
    left.integrate(transaction);
    return insertNegatedAttributes(transaction, parent, left, insertPos.right, insertPos.negatedAttributes)
  };

  /**
   * @param {Transaction} transaction
   * @param {AbstractType<any>} parent
   * @param {Item|null} left
   * @param {Item|null} right
   * @param {Map<string,any>} currentAttributes
   * @param {number} length
   * @param {Object<string,any>} attributes
   * @return {ItemListPosition}
   *
   * @private
   * @function
   */
  const formatText = (transaction, parent, left, right, currentAttributes, length, attributes) => {
    const minPos = minimizeAttributeChanges(left, right, currentAttributes, attributes);
    const insertPos = insertAttributes(transaction, parent, minPos.left, minPos.right, currentAttributes, attributes);
    const negatedAttributes = insertPos.negatedAttributes;
    left = insertPos.left;
    right = insertPos.right;
    // iterate until first non-format or null is found
    // delete all formats with attributes[format.key] != null
    while (length > 0 && right !== null) {
      if (right.deleted === false) {
        switch (right.content.constructor) {
          case ContentFormat:
            const { key, value } = /** @type {ContentFormat} */ (right.content);
            const attr = attributes[key];
            if (attr !== undefined) {
              if (attr === value) {
                negatedAttributes.delete(key);
              } else {
                negatedAttributes.set(key, value);
              }
              right.delete(transaction);
            }
            updateCurrentAttributes(currentAttributes, /** @type {ContentFormat} */ (right.content));
            break
          case ContentEmbed:
          case ContentString:
            if (length < right.length) {
              getItemCleanStart(transaction, transaction.doc.store, createID(right.id.client, right.id.clock + length));
            }
            length -= right.length;
            break
        }
      }
      left = right;
      right = right.right;
    }
    // Quill just assumes that the editor starts with a newline and that it always
    // ends with a newline. We only insert that newline when a new newline is
    // inserted - i.e when length is bigger than type.length
    if (length > 0) {
      let newlines = '';
      for (; length > 0; length--) {
        newlines += '\n';
      }
      left = new Item(nextID(transaction), left, left === null ? null : left.lastId, right, right === null ? null : right.id, parent, null, new ContentString(newlines));
      left.integrate(transaction);
    }
    return insertNegatedAttributes(transaction, parent, left, right, negatedAttributes)
  };

  /**
   * @param {Transaction} transaction
   * @param {Item|null} left
   * @param {Item|null} right
   * @param {Map<string,any>} currentAttributes
   * @param {number} length
   * @return {ItemListPosition}
   *
   * @private
   * @function
   */
  const deleteText = (transaction, left, right, currentAttributes, length) => {
    while (length > 0 && right !== null) {
      if (right.deleted === false) {
        switch (right.content.constructor) {
          case ContentFormat:
            updateCurrentAttributes(currentAttributes, /** @type {ContentFormat} */ (right.content));
            break
          case ContentEmbed:
          case ContentString:
            if (length < right.length) {
              getItemCleanStart(transaction, transaction.doc.store, createID(right.id.client, right.id.clock + length));
            }
            length -= right.length;
            right.delete(transaction);
            break
        }
      }
      left = right;
      right = right.right;
    }
    return { left, right }
  };

  /**
   * The Quill Delta format represents changes on a text document with
   * formatting information. For mor information visit {@link https://quilljs.com/docs/delta/|Quill Delta}
   *
   * @example
   *   {
   *     ops: [
   *       { insert: 'Gandalf', attributes: { bold: true } },
   *       { insert: ' the ' },
   *       { insert: 'Grey', attributes: { color: '#cccccc' } }
   *     ]
   *   }
   *
   */

  /**
    * Attributes that can be assigned to a selection of text.
    *
    * @example
    *   {
    *     bold: true,
    *     font-size: '40px'
    *   }
    *
    * @typedef {Object} TextAttributes
    */

  /**
   * @typedef {Object} DeltaItem
   * @property {number|undefined} DeltaItem.delete
   * @property {number|undefined} DeltaItem.retain
   * @property {string|undefined} DeltaItem.string
   * @property {Object<string,any>} DeltaItem.attributes
   */

  /**
   * Event that describes the changes on a YText type.
   */
  class YTextEvent extends YEvent {
    /**
     * @param {YText} ytext
     * @param {Transaction} transaction
     */
    constructor (ytext, transaction) {
      super(ytext, transaction);
      /**
       * @private
       * @type {Array<DeltaItem>|null}
       */
      this._delta = null;
    }
    /**
     * Compute the changes in the delta format.
     * A {@link https://quilljs.com/docs/delta/|Quill Delta}) that represents the changes on the document.
     *
     * @type {Array<DeltaItem>}
     *
     * @public
     */
    get delta () {
      if (this._delta === null) {
        const y = /** @type {Doc} */ (this.target.doc);
        this._delta = [];
        transact(y, transaction => {
          const delta = /** @type {Array<DeltaItem>} */ (this._delta);
          const currentAttributes = new Map(); // saves all current attributes for insert
          const oldAttributes = new Map();
          let item = this.target._start;
          /**
           * @type {string?}
           */
          let action = null;
          /**
           * @type {Object<string,any>}
           */
          let attributes = {}; // counts added or removed new attributes for retain
          let insert = '';
          let retain = 0;
          let deleteLen = 0;
          const addOp = () => {
            if (action !== null) {
              /**
               * @type {any}
               */
              let op;
              switch (action) {
                case 'delete':
                  op = { delete: deleteLen };
                  deleteLen = 0;
                  break
                case 'insert':
                  op = { insert };
                  if (currentAttributes.size > 0) {
                    op.attributes = {};
                    for (let [key, value] of currentAttributes) {
                      if (value !== null) {
                        op.attributes[key] = value;
                      }
                    }
                  }
                  insert = '';
                  break
                case 'retain':
                  op = { retain };
                  if (Object.keys(attributes).length > 0) {
                    op.attributes = {};
                    for (let key in attributes) {
                      op.attributes[key] = attributes[key];
                    }
                  }
                  retain = 0;
                  break
              }
              delta.push(op);
              action = null;
            }
          };
          while (item !== null) {
            switch (item.content.constructor) {
              case ContentEmbed:
                if (this.adds(item)) {
                  if (!this.deletes(item)) {
                    addOp();
                    action = 'insert';
                    insert = /** @type {ContentEmbed} */ (item.content).embed;
                    addOp();
                  }
                } else if (this.deletes(item)) {
                  if (action !== 'delete') {
                    addOp();
                    action = 'delete';
                  }
                  deleteLen += 1;
                } else if (!item.deleted) {
                  if (action !== 'retain') {
                    addOp();
                    action = 'retain';
                  }
                  retain += 1;
                }
                break
              case ContentString:
                if (this.adds(item)) {
                  if (!this.deletes(item)) {
                    if (action !== 'insert') {
                      addOp();
                      action = 'insert';
                    }
                    insert += /** @type {ContentString} */ (item.content).str;
                  }
                } else if (this.deletes(item)) {
                  if (action !== 'delete') {
                    addOp();
                    action = 'delete';
                  }
                  deleteLen += item.length;
                } else if (!item.deleted) {
                  if (action !== 'retain') {
                    addOp();
                    action = 'retain';
                  }
                  retain += item.length;
                }
                break
              case ContentFormat:
                const { key, value } = /** @type {ContentFormat} */ (item.content);
                if (this.adds(item)) {
                  if (!this.deletes(item)) {
                    const curVal = currentAttributes.get(key) || null;
                    if (curVal !== value) {
                      if (action === 'retain') {
                        addOp();
                      }
                      if (value === (oldAttributes.get(key) || null)) {
                        delete attributes[key];
                      } else {
                        attributes[key] = value;
                      }
                    } else {
                      item.delete(transaction);
                    }
                  }
                } else if (this.deletes(item)) {
                  oldAttributes.set(key, value);
                  const curVal = currentAttributes.get(key) || null;
                  if (curVal !== value) {
                    if (action === 'retain') {
                      addOp();
                    }
                    attributes[key] = curVal;
                  }
                } else if (!item.deleted) {
                  oldAttributes.set(key, value);
                  const attr = attributes[key];
                  if (attr !== undefined) {
                    if (attr !== value) {
                      if (action === 'retain') {
                        addOp();
                      }
                      if (value === null) {
                        attributes[key] = value;
                      } else {
                        delete attributes[key];
                      }
                    } else {
                      item.delete(transaction);
                    }
                  }
                }
                if (!item.deleted) {
                  if (action === 'insert') {
                    addOp();
                  }
                  updateCurrentAttributes(currentAttributes, /** @type {ContentFormat} */ (item.content));
                }
                break
            }
            item = item.right;
          }
          addOp();
          while (delta.length > 0) {
            let lastOp = delta[delta.length - 1];
            if (lastOp.retain !== undefined && lastOp.attributes === undefined) {
              // retain delta's if they don't assign attributes
              delta.pop();
            } else {
              break
            }
          }
        });
      }
      return this._delta
    }
  }

  /**
   * Type that represents text with formatting information.
   *
   * This type replaces y-richtext as this implementation is able to handle
   * block formats (format information on a paragraph), embeds (complex elements
   * like pictures and videos), and text formats (**bold**, *italic*).
   *
   * @extends AbstractType<YTextEvent>
   */
  class YText extends AbstractType {
    /**
     * @param {String} [string] The initial value of the YText.
     */
    constructor (string) {
      super();
      /**
       * Array of pending operations on this type
       * @type {Array<function():void>?}
       * @private
       */
      this._pending = string !== undefined ? [() => this.insert(0, string)] : [];
    }

    get length () {
      return this._length
    }

    /**
     * @param {Doc} y
     * @param {Item} item
     *
     * @private
     */
    _integrate (y, item) {
      super._integrate(y, item);
      try {
        /** @type {Array<function>} */ (this._pending).forEach(f => f());
      } catch (e) {
        console.error(e);
      }
      this._pending = null;
    }

    _copy () {
      return new YText()
    }

    /**
     * Creates YTextEvent and calls observers.
     *
     * @param {Transaction} transaction
     * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
     *
     * @private
     */
    _callObserver (transaction, parentSubs) {
      callTypeObservers(this, transaction, new YTextEvent(this, transaction));
    }

    /**
     * Returns the unformatted string representation of this YText type.
     *
     * @public
     */
    toString () {
      let str = '';
      /**
       * @type {Item|null}
       */
      let n = this._start;
      while (n !== null) {
        if (!n.deleted && n.countable && n.content.constructor === ContentString) {
          str += /** @type {ContentString} */ (n.content).str;
        }
        n = n.right;
      }
      return str
    }

    /**
     * Apply a {@link Delta} on this shared YText type.
     *
     * @param {any} delta The changes to apply on this element.
     *
     * @public
     */
    applyDelta (delta) {
      if (this.doc !== null) {
        transact(this.doc, transaction => {
          /**
           * @type {ItemListPosition}
           */
          let pos = new ItemListPosition(null, this._start);
          const currentAttributes = new Map();
          for (let i = 0; i < delta.length; i++) {
            const op = delta[i];
            if (op.insert !== undefined) {
              // Quill assumes that the content starts with an empty paragraph.
              // Yjs/Y.Text assumes that it starts empty. We always hide that
              // there is a newline at the end of the content.
              // If we omit this step, clients will see a different number of
              // paragraphs, but nothing bad will happen.
              const ins = (typeof op.insert === 'string' && i === delta.length - 1 && pos.right === null && op.insert.slice(-1) === '\n') ? op.insert.slice(0, -1) : op.insert;
              if (typeof ins !== 'string' || ins.length > 0) {
                pos = insertText(transaction, this, pos.left, pos.right, currentAttributes, ins, op.attributes || {});
              }
            } else if (op.retain !== undefined) {
              pos = formatText(transaction, this, pos.left, pos.right, currentAttributes, op.retain, op.attributes || {});
            } else if (op.delete !== undefined) {
              pos = deleteText(transaction, pos.left, pos.right, currentAttributes, op.delete);
            }
          }
        });
      } else {
        /** @type {Array<function>} */ (this._pending).push(() => this.applyDelta(delta));
      }
    }

    /**
     * Returns the Delta representation of this YText type.
     *
     * @param {Snapshot} [snapshot]
     * @param {Snapshot} [prevSnapshot]
     * @return {any} The Delta representation of this type.
     *
     * @public
     */
    toDelta (snapshot, prevSnapshot) {
      /**
       * @type{Array<any>}
       */
      const ops = [];
      const currentAttributes = new Map();
      let str = '';
      let n = this._start;
      function packStr () {
        if (str.length > 0) {
          // pack str with attributes to ops
          /**
           * @type {Object<string,any>}
           */
          const attributes = {};
          let addAttributes = false;
          for (let [key, value] of currentAttributes) {
            addAttributes = true;
            attributes[key] = value;
          }
          /**
           * @type {Object<string,any>}
           */
          const op = { insert: str };
          if (addAttributes) {
            op.attributes = attributes;
          }
          ops.push(op);
          str = '';
        }
      }
      while (n !== null) {
        if (isVisible(n, snapshot) || (prevSnapshot !== undefined && isVisible(n, prevSnapshot))) {
          switch (n.content.constructor) {
            case ContentString:
              const cur = currentAttributes.get('ychange');
              if (snapshot !== undefined && !isVisible(n, snapshot)) {
                if (cur === undefined || cur.user !== n.id.client || cur.state !== 'removed') {
                  packStr();
                  currentAttributes.set('ychange', { user: n.id.client, state: 'removed' });
                }
              } else if (prevSnapshot !== undefined && !isVisible(n, prevSnapshot)) {
                if (cur === undefined || cur.user !== n.id.client || cur.state !== 'added') {
                  packStr();
                  currentAttributes.set('ychange', { user: n.id.client, state: 'added' });
                }
              } else if (cur !== undefined) {
                packStr();
                currentAttributes.delete('ychange');
              }
              str += /** @type {ContentString} */ (n.content).str;
              break
            case ContentEmbed:
              packStr();
              ops.push({
                insert: /** @type {ContentEmbed} */ (n.content).embed
              });
              break
            case ContentFormat:
              packStr();
              updateCurrentAttributes(currentAttributes, /** @type {ContentFormat} */ (n.content));
              break
          }
        }
        n = n.right;
      }
      packStr();
      return ops
    }

    /**
     * Insert text at a given index.
     *
     * @param {number} index The index at which to start inserting.
     * @param {String} text The text to insert at the specified position.
     * @param {TextAttributes} attributes Optionally define some formatting
     *                                    information to apply on the inserted
     *                                    Text.
     * @public
     */
    insert (index, text, attributes = {}) {
      if (text.length <= 0) {
        return
      }
      const y = this.doc;
      if (y !== null) {
        transact(y, transaction => {
          const { left, right, currentAttributes } = findPosition(transaction, y.store, this, index);
          insertText(transaction, this, left, right, currentAttributes, text, attributes);
        });
      } else {
        /** @type {Array<function>} */ (this._pending).push(() => this.insert(index, text, attributes));
      }
    }

    /**
     * Inserts an embed at a index.
     *
     * @param {number} index The index to insert the embed at.
     * @param {Object} embed The Object that represents the embed.
     * @param {TextAttributes} attributes Attribute information to apply on the
     *                                    embed
     *
     * @public
     */
    insertEmbed (index, embed, attributes = {}) {
      if (embed.constructor !== Object) {
        throw new Error('Embed must be an Object')
      }
      const y = this.doc;
      if (y !== null) {
        transact(y, transaction => {
          const { left, right, currentAttributes } = findPosition(transaction, y.store, this, index);
          insertText(transaction, this, left, right, currentAttributes, embed, attributes);
        });
      } else {
        /** @type {Array<function>} */ (this._pending).push(() => this.insertEmbed(index, embed, attributes));
      }
    }

    /**
     * Deletes text starting from an index.
     *
     * @param {number} index Index at which to start deleting.
     * @param {number} length The number of characters to remove. Defaults to 1.
     *
     * @public
     */
    delete (index, length) {
      if (length === 0) {
        return
      }
      const y = this.doc;
      if (y !== null) {
        transact(y, transaction => {
          const { left, right, currentAttributes } = findPosition(transaction, y.store, this, index);
          deleteText(transaction, left, right, currentAttributes, length);
        });
      } else {
        /** @type {Array<function>} */ (this._pending).push(() => this.delete(index, length));
      }
    }

    /**
     * Assigns properties to a range of text.
     *
     * @param {number} index The position where to start formatting.
     * @param {number} length The amount of characters to assign properties to.
     * @param {TextAttributes} attributes Attribute information to apply on the
     *                                    text.
     *
     * @public
     */
    format (index, length, attributes) {
      const y = this.doc;
      if (y !== null) {
        transact(y, transaction => {
          let { left, right, currentAttributes } = findPosition(transaction, y.store, this, index);
          if (right === null) {
            return
          }
          formatText(transaction, this, left, right, currentAttributes, length, attributes);
        });
      } else {
        /** @type {Array<function>} */ (this._pending).push(() => this.format(index, length, attributes));
      }
    }

    /**
     * @param {encoding.Encoder} encoder
     *
     * @private
     */
    _write (encoder) {
      writeVarUint(encoder, YTextRefID);
    }
  }

  /**
   * @param {decoding.Decoder} decoder
   * @return {YText}
   *
   * @private
   * @function
   */
  const readYText = decoder => new YText();

  /**
   * @module YXml
   */

  /**
   * Define the elements to which a set of CSS queries apply.
   * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors|CSS_Selectors}
   *
   * @example
   *   query = '.classSelector'
   *   query = 'nodeSelector'
   *   query = '#idSelector'
   *
   * @typedef {string} CSS_Selector
   */

  /**
   * Dom filter function.
   *
   * @callback domFilter
   * @param {string} nodeName The nodeName of the element
   * @param {Map} attributes The map of attributes.
   * @return {boolean} Whether to include the Dom node in the YXmlElement.
   */

  /**
   * Represents a subset of the nodes of a YXmlElement / YXmlFragment and a
   * position within them.
   *
   * Can be created with {@link YXmlFragment#createTreeWalker}
   *
   * @public
   * @implements {IterableIterator}
   */
  class YXmlTreeWalker {
    /**
     * @param {YXmlFragment | YXmlElement} root
     * @param {function(AbstractType<any>):boolean} [f]
     */
    constructor (root, f = () => true) {
      this._filter = f;
      this._root = root;
      /**
       * @type {Item}
       */
      this._currentNode = /** @type {Item} */ (root._start);
      this._firstCall = true;
    }

    [Symbol.iterator] () {
      return this
    }
    /**
     * Get the next node.
     *
     * @return {IteratorResult<YXmlElement|YXmlText|YXmlHook>} The next node.
     *
     * @public
     */
    next () {
      /**
       * @type {Item|null}
       */
      let n = this._currentNode;
      let type = /** @type {ContentType} */ (n.content).type;
      if (n !== null && (!this._firstCall || n.deleted || !this._filter(type))) { // if first call, we check if we can use the first item
        do {
          type = /** @type {ContentType} */ (n.content).type;
          if (!n.deleted && (type.constructor === YXmlElement || type.constructor === YXmlFragment) && type._start !== null) {
            // walk down in the tree
            n = type._start;
          } else {
            // walk right or up in the tree
            while (n !== null) {
              if (n.right !== null) {
                n = n.right;
                break
              } else if (n.parent === this._root) {
                n = null;
              } else {
                n = n.parent._item;
              }
            }
          }
        } while (n !== null && (n.deleted || !this._filter(/** @type {ContentType} */ (n.content).type)))
      }
      this._firstCall = false;
      if (n === null) {
        // @ts-ignore
        return { value: undefined, done: true }
      }
      this._currentNode = n;
      return { value: /** @type {any} */ (n.content).type, done: false }
    }
  }

  /**
   * Represents a list of {@link YXmlElement}.and {@link YXmlText} types.
   * A YxmlFragment is similar to a {@link YXmlElement}, but it does not have a
   * nodeName and it does not have attributes. Though it can be bound to a DOM
   * element - in this case the attributes and the nodeName are not shared.
   *
   * @public
   * @extends AbstractType<YXmlEvent>
   */
  class YXmlFragment extends AbstractType {
    constructor () {
      super();
      /**
       * @type {Array<any>|null}
       * @private
       */
      this._prelimContent = [];
    }
    /**
     * Integrate this type into the Yjs instance.
     *
     * * Save this struct in the os
     * * This type is sent to other client
     * * Observer functions are fired
     *
     * @param {Doc} y The Yjs instance
     * @param {Item} item
     * @private
     */
    _integrate (y, item) {
      super._integrate(y, item);
      this.insert(0, /** @type {Array} */ (this._prelimContent));
      this._prelimContent = null;
    }

    _copy () {
      return new YXmlFragment()
    }

    /**
     * Create a subtree of childNodes.
     *
     * @example
     * const walker = elem.createTreeWalker(dom => dom.nodeName === 'div')
     * for (let node in walker) {
     *   // `node` is a div node
     *   nop(node)
     * }
     *
     * @param {function(AbstractType<any>):boolean} filter Function that is called on each child element and
     *                          returns a Boolean indicating whether the child
     *                          is to be included in the subtree.
     * @return {YXmlTreeWalker} A subtree and a position within it.
     *
     * @public
     */
    createTreeWalker (filter) {
      return new YXmlTreeWalker(this, filter)
    }

    /**
     * Returns the first YXmlElement that matches the query.
     * Similar to DOM's {@link querySelector}.
     *
     * Query support:
     *   - tagname
     * TODO:
     *   - id
     *   - attribute
     *
     * @param {CSS_Selector} query The query on the children.
     * @return {YXmlElement|YXmlText|YXmlHook|null} The first element that matches the query or null.
     *
     * @public
     */
    querySelector (query) {
      query = query.toUpperCase();
      // @ts-ignore
      const iterator = new YXmlTreeWalker(this, element => element.nodeName && element.nodeName.toUpperCase() === query);
      const next = iterator.next();
      if (next.done) {
        return null
      } else {
        return next.value
      }
    }

    /**
     * Returns all YXmlElements that match the query.
     * Similar to Dom's {@link querySelectorAll}.
     *
     * @todo Does not yet support all queries. Currently only query by tagName.
     *
     * @param {CSS_Selector} query The query on the children
     * @return {Array<YXmlElement|YXmlText|YXmlHook|null>} The elements that match this query.
     *
     * @public
     */
    querySelectorAll (query) {
      query = query.toUpperCase();
      // @ts-ignore
      return Array.from(new YXmlTreeWalker(this, element => element.nodeName && element.nodeName.toUpperCase() === query))
    }

    /**
     * Creates YXmlEvent and calls observers.
     * @private
     *
     * @param {Transaction} transaction
     * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
     */
    _callObserver (transaction, parentSubs) {
      callTypeObservers(this, transaction, new YXmlEvent(this, parentSubs, transaction));
    }

    /**
     * Get the string representation of all the children of this YXmlFragment.
     *
     * @return {string} The string representation of all children.
     */
    toString () {
      return typeListMap(this, xml => xml.toString()).join('')
    }

    toJSON () {
      return this.toString()
    }

    /**
     * Creates a Dom Element that mirrors this YXmlElement.
     *
     * @param {Document} [_document=document] The document object (you must define
     *                                        this when calling this method in
     *                                        nodejs)
     * @param {Object<string, any>} [hooks={}] Optional property to customize how hooks
     *                                             are presented in the DOM
     * @param {any} [binding] You should not set this property. This is
     *                               used if DomBinding wants to create a
     *                               association to the created DOM type.
     * @return {Node} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
     *
     * @public
     */
    toDOM (_document = document, hooks = {}, binding) {
      const fragment = _document.createDocumentFragment();
      if (binding !== undefined) {
        binding._createAssociation(fragment, this);
      }
      typeListForEach(this, xmlType => {
        fragment.insertBefore(xmlType.toDOM(_document, hooks, binding), null);
      });
      return fragment
    }

    /**
     * Inserts new content at an index.
     *
     * @example
     *  // Insert character 'a' at position 0
     *  xml.insert(0, [new Y.XmlText('text')])
     *
     * @param {number} index The index to insert content at
     * @param {Array<YXmlElement|YXmlText>} content The array of content
     */
    insert (index, content) {
      if (this.doc !== null) {
        transact(this.doc, transaction => {
          typeListInsertGenerics(transaction, this, index, content);
        });
      } else {
        // @ts-ignore _prelimContent is defined because this is not yet integrated
        this._prelimContent.splice(index, 0, ...content);
      }
    }

    /**
     * Deletes elements starting from an index.
     *
     * @param {number} index Index at which to start deleting elements
     * @param {number} [length=1] The number of elements to remove. Defaults to 1.
     */
    delete (index, length = 1) {
      if (this.doc !== null) {
        transact(this.doc, transaction => {
          typeListDelete(transaction, this, index, length);
        });
      } else {
        // @ts-ignore _prelimContent is defined because this is not yet integrated
        this._prelimContent.splice(index, length);
      }
    }
    /**
     * Transforms this YArray to a JavaScript Array.
     *
     * @return {Array<YXmlElement|YXmlText|YXmlHook>}
     */
    toArray () {
      return typeListToArray(this)
    }
    /**
     * Transform the properties of this type to binary and write it to an
     * BinaryEncoder.
     *
     * This is called when this Item is sent to a remote peer.
     *
     * @private
     * @param {encoding.Encoder} encoder The encoder to write data to.
     */
    _write (encoder) {
      writeVarUint(encoder, YXmlFragmentRefID);
    }
  }

  /**
   * @param {decoding.Decoder} decoder
   * @return {YXmlFragment}
   *
   * @private
   * @function
   */
  const readYXmlFragment = decoder => new YXmlFragment();

  /**
   * An YXmlElement imitates the behavior of a
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}.
   *
   * * An YXmlElement has attributes (key value pairs)
   * * An YXmlElement has childElements that must inherit from YXmlElement
   */
  class YXmlElement extends YXmlFragment {
    constructor (nodeName = 'UNDEFINED') {
      super();
      this.nodeName = nodeName;
      /**
       * @type {Map<string, any>|null}
       * @private
       */
      this._prelimAttrs = new Map();
    }

    /**
     * Integrate this type into the Yjs instance.
     *
     * * Save this struct in the os
     * * This type is sent to other client
     * * Observer functions are fired
     *
     * @param {Doc} y The Yjs instance
     * @param {Item} item
     * @private
     */
    _integrate (y, item) {
      super._integrate(y, item)
      ;(/** @type {Map<string, any>} */ (this._prelimAttrs)).forEach((value, key) => {
        this.setAttribute(key, value);
      });
      this._prelimAttrs = null;
    }

    /**
     * Creates an Item with the same effect as this Item (without position effect)
     *
     * @return {YXmlElement}
     * @private
     */
    _copy () {
      return new YXmlElement(this.nodeName)
    }

    /**
     * Returns the XML serialization of this YXmlElement.
     * The attributes are ordered by attribute-name, so you can easily use this
     * method to compare YXmlElements
     *
     * @return {string} The string representation of this type.
     *
     * @public
     */
    toString () {
      const attrs = this.getAttributes();
      const stringBuilder = [];
      const keys = [];
      for (let key in attrs) {
        keys.push(key);
      }
      keys.sort();
      const keysLen = keys.length;
      for (let i = 0; i < keysLen; i++) {
        const key = keys[i];
        stringBuilder.push(key + '="' + attrs[key] + '"');
      }
      const nodeName = this.nodeName.toLocaleLowerCase();
      const attrsString = stringBuilder.length > 0 ? ' ' + stringBuilder.join(' ') : '';
      return `<${nodeName}${attrsString}>${super.toString()}</${nodeName}>`
    }

    /**
     * Removes an attribute from this YXmlElement.
     *
     * @param {String} attributeName The attribute name that is to be removed.
     *
     * @public
     */
    removeAttribute (attributeName) {
      if (this.doc !== null) {
        transact(this.doc, transaction => {
          typeMapDelete(transaction, this, attributeName);
        });
      } else {
        /** @type {Map<string,any>} */ (this._prelimAttrs).delete(attributeName);
      }
    }

    /**
     * Sets or updates an attribute.
     *
     * @param {String} attributeName The attribute name that is to be set.
     * @param {String} attributeValue The attribute value that is to be set.
     *
     * @public
     */
    setAttribute (attributeName, attributeValue) {
      if (this.doc !== null) {
        transact(this.doc, transaction => {
          typeMapSet(transaction, this, attributeName, attributeValue);
        });
      } else {
        /** @type {Map<string, any>} */ (this._prelimAttrs).set(attributeName, attributeValue);
      }
    }

    /**
     * Returns an attribute value that belongs to the attribute name.
     *
     * @param {String} attributeName The attribute name that identifies the
     *                               queried value.
     * @return {String} The queried attribute value.
     *
     * @public
     */
    getAttribute (attributeName) {
      return /** @type {any} */ (typeMapGet(this, attributeName))
    }

    /**
     * Returns all attribute name/value pairs in a JSON Object.
     *
     * @param {Snapshot} [snapshot]
     * @return {Object} A JSON Object that describes the attributes.
     *
     * @public
     */
    getAttributes (snapshot) {
      return typeMapGetAll(this)
    }

    /**
     * Creates a Dom Element that mirrors this YXmlElement.
     *
     * @param {Document} [_document=document] The document object (you must define
     *                                        this when calling this method in
     *                                        nodejs)
     * @param {Object<string, any>} [hooks={}] Optional property to customize how hooks
     *                                             are presented in the DOM
     * @param {any} [binding] You should not set this property. This is
     *                               used if DomBinding wants to create a
     *                               association to the created DOM type.
     * @return {Node} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
     *
     * @public
     */
    toDOM (_document = document, hooks = {}, binding) {
      const dom = _document.createElement(this.nodeName);
      let attrs = this.getAttributes();
      for (let key in attrs) {
        dom.setAttribute(key, attrs[key]);
      }
      typeListForEach(this, yxml => {
        dom.appendChild(yxml.toDOM(_document, hooks, binding));
      });
      if (binding !== undefined) {
        binding._createAssociation(dom, this);
      }
      return dom
    }

    /**
     * Transform the properties of this type to binary and write it to an
     * BinaryEncoder.
     *
     * This is called when this Item is sent to a remote peer.
     *
     * @private
     * @param {encoding.Encoder} encoder The encoder to write data to.
     */
    _write (encoder) {
      writeVarUint(encoder, YXmlElementRefID);
      writeVarString(encoder, this.nodeName);
    }
  }

  /**
   * @param {decoding.Decoder} decoder
   * @return {YXmlElement}
   *
   * @private
   * @function
   */
  const readYXmlElement = decoder => new YXmlElement(readVarString(decoder));

  /**
   * An Event that describes changes on a YXml Element or Yxml Fragment
   */
  class YXmlEvent extends YEvent {
    /**
     * @param {YXmlElement|YXmlFragment} target The target on which the event is created.
     * @param {Set<string|null>} subs The set of changed attributes. `null` is included if the
     *                   child list changed.
     * @param {Transaction} transaction The transaction instance with wich the
     *                                  change was created.
     */
    constructor (target, subs, transaction) {
      super(target, transaction);
      /**
       * Whether the children changed.
       * @type {Boolean}
       * @private
       */
      this.childListChanged = false;
      /**
       * Set of all changed attributes.
       * @type {Set<string|null>}
       */
      this.attributesChanged = new Set();
      subs.forEach((sub) => {
        if (sub === null) {
          this.childListChanged = true;
        } else {
          this.attributesChanged.add(sub);
        }
      });
    }
  }

  /**
   * You can manage binding to a custom type with YXmlHook.
   *
   * @extends {YMap<any>}
   */
  class YXmlHook extends YMap {
    /**
     * @param {string} hookName nodeName of the Dom Node.
     */
    constructor (hookName) {
      super();
      /**
       * @type {string}
       */
      this.hookName = hookName;
    }

    /**
     * Creates an Item with the same effect as this Item (without position effect)
     *
     * @private
     */
    _copy () {
      return new YXmlHook(this.hookName)
    }

    /**
     * Creates a Dom Element that mirrors this YXmlElement.
     *
     * @param {Document} [_document=document] The document object (you must define
     *                                        this when calling this method in
     *                                        nodejs)
     * @param {Object.<string, any>} [hooks] Optional property to customize how hooks
     *                                             are presented in the DOM
     * @param {any} [binding] You should not set this property. This is
     *                               used if DomBinding wants to create a
     *                               association to the created DOM type
     * @return {Element} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
     *
     * @public
     */
    toDOM (_document = document, hooks = {}, binding) {
      const hook = hooks[this.hookName];
      let dom;
      if (hook !== undefined) {
        dom = hook.createDom(this);
      } else {
        dom = document.createElement(this.hookName);
      }
      dom.setAttribute('data-yjs-hook', this.hookName);
      if (binding !== undefined) {
        binding._createAssociation(dom, this);
      }
      return dom
    }

    /**
     * Transform the properties of this type to binary and write it to an
     * BinaryEncoder.
     *
     * This is called when this Item is sent to a remote peer.
     *
     * @param {encoding.Encoder} encoder The encoder to write data to.
     *
     * @private
     */
    _write (encoder) {
      super._write(encoder);
      writeVarUint(encoder, YXmlHookRefID);
      writeVarString(encoder, this.hookName);
    }
  }

  /**
   * @param {decoding.Decoder} decoder
   * @return {YXmlHook}
   *
   * @private
   * @function
   */
  const readYXmlHook = decoder =>
    new YXmlHook(readVarString(decoder));

  /**
   * Represents text in a Dom Element. In the future this type will also handle
   * simple formatting information like bold and italic.
   */
  class YXmlText extends YText {
    _copy () {
      return new YXmlText()
    }
    /**
     * Creates a Dom Element that mirrors this YXmlText.
     *
     * @param {Document} [_document=document] The document object (you must define
     *                                        this when calling this method in
     *                                        nodejs)
     * @param {Object<string, any>} [hooks] Optional property to customize how hooks
     *                                             are presented in the DOM
     * @param {any} [binding] You should not set this property. This is
     *                               used if DomBinding wants to create a
     *                               association to the created DOM type.
     * @return {Text} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
     *
     * @public
     */
    toDOM (_document = document, hooks, binding) {
      const dom = _document.createTextNode(this.toString());
      if (binding !== undefined) {
        binding._createAssociation(dom, this);
      }
      return dom
    }

    toString () {
      // @ts-ignore
      return this.toDelta().map(delta => {
        const nestedNodes = [];
        for (let nodeName in delta.attributes) {
          const attrs = [];
          for (let key in delta.attributes[nodeName]) {
            attrs.push({ key, value: delta.attributes[nodeName][key] });
          }
          // sort attributes to get a unique order
          attrs.sort((a, b) => a.key < b.key ? -1 : 1);
          nestedNodes.push({ nodeName, attrs });
        }
        // sort node order to get a unique order
        nestedNodes.sort((a, b) => a.nodeName < b.nodeName ? -1 : 1);
        // now convert to dom string
        let str = '';
        for (let i = 0; i < nestedNodes.length; i++) {
          const node = nestedNodes[i];
          str += `<${node.nodeName}`;
          for (let j = 0; j < node.attrs.length; j++) {
            const attr = node.attrs[i];
            str += ` ${attr.key}="${attr.value}"`;
          }
          str += '>';
        }
        str += delta.insert;
        for (let i = nestedNodes.length - 1; i >= 0; i--) {
          str += `</${nestedNodes[i].nodeName}>`;
        }
        return str
      }).join('')
    }

    toJSON () {
      return this.toString()
    }

    /**
     * @param {encoding.Encoder} encoder
     *
     * @private
     */
    _write (encoder) {
      writeVarUint(encoder, YXmlTextRefID);
    }
  }

  /**
   * @param {decoding.Decoder} decoder
   * @return {YXmlText}
   *
   * @private
   * @function
   */
  const readYXmlText = decoder => new YXmlText();

  /**
   * @private
   */
  class AbstractStruct {
    /**
     * @param {ID} id
     * @param {number} length
     */
    constructor (id, length) {
      /**
       * The uniqe identifier of this struct.
       * @type {ID}
       * @readonly
       */
      this.id = id;
      this.length = length;
      this.deleted = false;
    }
    /**
     * Merge this struct with the item to the right.
     * This method is already assuming that `this.id.clock + this.length === this.id.clock`.
     * Also this method does *not* remove right from StructStore!
     * @param {AbstractStruct} right
     * @return {boolean} wether this merged with right
     */
    mergeWith (right) {
      return false
    }
    /**
     * @param {encoding.Encoder} encoder The encoder to write data to.
     * @param {number} offset
     * @param {number} encodingRef
     * @private
     */
    write (encoder, offset, encodingRef) {
      throw methodUnimplemented()
    }
    /**
     * @param {Transaction} transaction
     */
    integrate (transaction) {
      throw methodUnimplemented()
    }
  }

  /**
   * @private
   */
  class AbstractStructRef {
    /**
     * @param {ID} id
     */
    constructor (id) {
      /**
       * @type {Array<ID>}
       */
      this._missing = [];
      /**
       * The uniqe identifier of this type.
       * @type {ID}
       */
      this.id = id;
    }
    /**
     * @param {Transaction} transaction
     * @return {Array<ID|null>}
     */
    getMissing (transaction) {
      return this._missing
    }
    /**
     * @param {Transaction} transaction
     * @param {StructStore} store
     * @param {number} offset
     * @return {AbstractStruct}
     */
    toStruct (transaction, store, offset) {
      throw methodUnimplemented()
    }
  }

  const structGCRefNumber = 0;

  /**
   * @private
   */
  class GC extends AbstractStruct {
    /**
     * @param {ID} id
     * @param {number} length
     */
    constructor (id, length) {
      super(id, length);
      this.deleted = true;
    }

    delete () {}

    /**
     * @param {GC} right
     * @return {boolean}
     */
    mergeWith (right) {
      this.length += right.length;
      return true
    }

    /**
     * @param {Transaction} transaction
     */
    integrate (transaction) {
      addStruct(transaction.doc.store, this);
    }

    /**
     * @param {encoding.Encoder} encoder
     * @param {number} offset
     */
    write (encoder, offset) {
      writeUint8(encoder, structGCRefNumber);
      writeVarUint(encoder, this.length - offset);
    }
  }

  /**
   * @private
   */
  class GCRef extends AbstractStructRef {
    /**
     * @param {decoding.Decoder} decoder
     * @param {ID} id
     * @param {number} info
     */
    constructor (decoder, id, info) {
      super(id);
      /**
       * @type {number}
       */
      this.length = readVarUint(decoder);
    }
    /**
     * @param {Transaction} transaction
     * @param {StructStore} store
     * @param {number} offset
     * @return {GC}
     */
    toStruct (transaction, store, offset) {
      if (offset > 0) {
        // @ts-ignore
        this.id = createID(this.id.client, this.id.clock + offset);
        this.length -= offset;
      }
      return new GC(
        this.id,
        this.length
      )
    }
  }

  /**
   * @private
   */
  class ContentBinary {
    /**
     * @param {Uint8Array} content
     */
    constructor (content) {
      this.content = content;
    }
    /**
     * @return {number}
     */
    getLength () {
      return 1
    }
    /**
     * @return {Array<any>}
     */
    getContent () {
      return [this.content]
    }
    /**
     * @return {boolean}
     */
    isCountable () {
      return true
    }
    /**
     * @return {ContentBinary}
     */
    copy () {
      return new ContentBinary(this.content)
    }
    /**
     * @param {number} offset
     * @return {ContentBinary}
     */
    splice (offset) {
      throw methodUnimplemented()
    }
    /**
     * @param {ContentBinary} right
     * @return {boolean}
     */
    mergeWith (right) {
      return false
    }
    /**
     * @param {Transaction} transaction
     * @param {Item} item
     */
    integrate (transaction, item) {}
    /**
     * @param {Transaction} transaction
     */
    delete (transaction) {}
    /**
     * @param {StructStore} store
     */
    gc (store) {}
    /**
     * @param {encoding.Encoder} encoder
     * @param {number} offset
     */
    write (encoder, offset) {
      writeVarUint8Array(encoder, this.content);
    }
    /**
     * @return {number}
     */
    getRef () {
      return 3
    }
  }

  /**
   * @private
   *
   * @param {decoding.Decoder} decoder
   * @return {ContentBinary}
   */
  const readContentBinary = decoder => new ContentBinary(copyUint8Array(readVarUint8Array(decoder)));

  /**
   * @private
   */
  class ContentDeleted {
    /**
     * @param {number} len
     */
    constructor (len) {
      this.len = len;
    }
    /**
     * @return {number}
     */
    getLength () {
      return this.len
    }
    /**
     * @return {Array<any>}
     */
    getContent () {
      return []
    }
    /**
     * @return {boolean}
     */
    isCountable () {
      return false
    }
    /**
     * @return {ContentDeleted}
     */
    copy () {
      return new ContentDeleted(this.len)
    }
    /**
     * @param {number} offset
     * @return {ContentDeleted}
     */
    splice (offset) {
      const right = new ContentDeleted(this.len - offset);
      this.len = offset;
      return right
    }
    /**
     * @param {ContentDeleted} right
     * @return {boolean}
     */
    mergeWith (right) {
      this.len += right.len;
      return true
    }
    /**
     * @param {Transaction} transaction
     * @param {Item} item
     */
    integrate (transaction, item) {
      addToDeleteSet(transaction.deleteSet, item.id, this.len);
      item.deleted = true;
    }
    /**
     * @param {Transaction} transaction
     */
    delete (transaction) {}
    /**
     * @param {StructStore} store
     */
    gc (store) {}
    /**
     * @param {encoding.Encoder} encoder
     * @param {number} offset
     */
    write (encoder, offset) {
      writeVarUint(encoder, this.len - offset);
    }
    /**
     * @return {number}
     */
    getRef () {
      return 1
    }
  }

  /**
   * @private
   *
   * @param {decoding.Decoder} decoder
   * @return {ContentDeleted}
   */
  const readContentDeleted = decoder => new ContentDeleted(readVarUint(decoder));

  /**
   * @private
   */
  class ContentEmbed {
    /**
     * @param {Object} embed
     */
    constructor (embed) {
      this.embed = embed;
    }
    /**
     * @return {number}
     */
    getLength () {
      return 1
    }
    /**
     * @return {Array<any>}
     */
    getContent () {
      return [this.embed]
    }
    /**
     * @return {boolean}
     */
    isCountable () {
      return true
    }
    /**
     * @return {ContentEmbed}
     */
    copy () {
      return new ContentEmbed(this.embed)
    }
    /**
     * @param {number} offset
     * @return {ContentEmbed}
     */
    splice (offset) {
      throw methodUnimplemented()
    }
    /**
     * @param {ContentEmbed} right
     * @return {boolean}
     */
    mergeWith (right) {
      return false
    }
    /**
     * @param {Transaction} transaction
     * @param {Item} item
     */
    integrate (transaction, item) {}
    /**
     * @param {Transaction} transaction
     */
    delete (transaction) {}
    /**
     * @param {StructStore} store
     */
    gc (store) {}
    /**
     * @param {encoding.Encoder} encoder
     * @param {number} offset
     */
    write (encoder, offset) {
      writeVarString(encoder, JSON.stringify(this.embed));
    }
    /**
     * @return {number}
     */
    getRef () {
      return 5
    }
  }

  /**
   * @private
   *
   * @param {decoding.Decoder} decoder
   * @return {ContentEmbed}
   */
  const readContentEmbed = decoder => new ContentEmbed(JSON.parse(readVarString(decoder)));

  /**
   * @private
   */
  class ContentFormat {
    /**
     * @param {string} key
     * @param {Object} value
     */
    constructor (key, value) {
      this.key = key;
      this.value = value;
    }
    /**
     * @return {number}
     */
    getLength () {
      return 1
    }
    /**
     * @return {Array<any>}
     */
    getContent () {
      return []
    }
    /**
     * @return {boolean}
     */
    isCountable () {
      return false
    }
    /**
     * @return {ContentFormat}
     */
    copy () {
      return new ContentFormat(this.key, this.value)
    }
    /**
     * @param {number} offset
     * @return {ContentFormat}
     */
    splice (offset) {
      throw methodUnimplemented()
    }
    /**
     * @param {ContentFormat} right
     * @return {boolean}
     */
    mergeWith (right) {
      return false
    }
    /**
     * @param {Transaction} transaction
     * @param {Item} item
     */
    integrate (transaction, item) {}
    /**
     * @param {Transaction} transaction
     */
    delete (transaction) {}
    /**
     * @param {StructStore} store
     */
    gc (store) {}
    /**
     * @param {encoding.Encoder} encoder
     * @param {number} offset
     */
    write (encoder, offset) {
      writeVarString(encoder, this.key);
      writeVarString(encoder, JSON.stringify(this.value));
    }
    /**
     * @return {number}
     */
    getRef () {
      return 6
    }
  }

  /**
   * @private
   *
   * @param {decoding.Decoder} decoder
   * @return {ContentFormat}
   */
  const readContentFormat = decoder => new ContentFormat(readVarString(decoder), JSON.parse(readVarString(decoder)));

  /**
   * @private
   */
  class ContentJSON {
    /**
     * @param {Array<any>} arr
     */
    constructor (arr) {
      /**
       * @type {Array<any>}
       */
      this.arr = arr;
    }
    /**
     * @return {number}
     */
    getLength () {
      return this.arr.length
    }
    /**
     * @return {Array<any>}
     */
    getContent () {
      return this.arr
    }
    /**
     * @return {boolean}
     */
    isCountable () {
      return true
    }
    /**
     * @return {ContentJSON}
     */
    copy () {
      return new ContentJSON(this.arr)
    }
    /**
     * @param {number} offset
     * @return {ContentJSON}
     */
    splice (offset) {
      const right = new ContentJSON(this.arr.slice(offset));
      this.arr = this.arr.slice(0, offset);
      return right
    }
    /**
     * @param {ContentJSON} right
     * @return {boolean}
     */
    mergeWith (right) {
      this.arr = this.arr.concat(right.arr);
      return true
    }
    /**
     * @param {Transaction} transaction
     * @param {Item} item
     */
    integrate (transaction, item) {}
    /**
     * @param {Transaction} transaction
     */
    delete (transaction) {}
    /**
     * @param {StructStore} store
     */
    gc (store) {}
    /**
     * @param {encoding.Encoder} encoder
     * @param {number} offset
     */
    write (encoder, offset) {
      const len = this.arr.length;
      writeVarUint(encoder, len - offset);
      for (let i = offset; i < len; i++) {
        const c = this.arr[i];
        writeVarString(encoder, c === undefined ? 'undefined' : JSON.stringify(c));
      }
    }
    /**
     * @return {number}
     */
    getRef () {
      return 2
    }
  }

  /**
   * @private
   *
   * @param {decoding.Decoder} decoder
   * @return {ContentJSON}
   */
  const readContentJSON = decoder => {
    const len = readVarUint(decoder);
    const cs = [];
    for (let i = 0; i < len; i++) {
      const c = readVarString(decoder);
      if (c === 'undefined') {
        cs.push(undefined);
      } else {
        cs.push(JSON.parse(c));
      }
    }
    return new ContentJSON(cs)
  };

  /**
   * @private
   */
  class ContentString {
    /**
     * @param {string} str
     */
    constructor (str) {
      /**
       * @type {string}
       */
      this.str = str;
    }
    /**
     * @return {number}
     */
    getLength () {
      return this.str.length
    }
    /**
     * @return {Array<any>}
     */
    getContent () {
      return this.str.split('')
    }
    /**
     * @return {boolean}
     */
    isCountable () {
      return true
    }
    /**
     * @return {ContentString}
     */
    copy () {
      return new ContentString(this.str)
    }
    /**
     * @param {number} offset
     * @return {ContentString}
     */
    splice (offset) {
      const right = new ContentString(this.str.slice(offset));
      this.str = this.str.slice(0, offset);
      return right
    }
    /**
     * @param {ContentString} right
     * @return {boolean}
     */
    mergeWith (right) {
      this.str += right.str;
      return true
    }
    /**
     * @param {Transaction} transaction
     * @param {Item} item
     */
    integrate (transaction, item) {}
    /**
     * @param {Transaction} transaction
     */
    delete (transaction) {}
    /**
     * @param {StructStore} store
     */
    gc (store) {}
    /**
     * @param {encoding.Encoder} encoder
     * @param {number} offset
     */
    write (encoder, offset) {
      writeVarString(encoder, offset === 0 ? this.str : this.str.slice(offset));
    }
    /**
     * @return {number}
     */
    getRef () {
      return 4
    }
  }

  /**
   * @private
   *
   * @param {decoding.Decoder} decoder
   * @return {ContentString}
   */
  const readContentString = decoder => new ContentString(readVarString(decoder));

  /**
   * @type {Array<function(decoding.Decoder):AbstractType<any>>}
   * @private
   */
  const typeRefs = [
    readYArray,
    readYMap,
    readYText,
    readYXmlElement,
    readYXmlFragment,
    readYXmlHook,
    readYXmlText
  ];

  const YArrayRefID = 0;
  const YMapRefID = 1;
  const YTextRefID = 2;
  const YXmlElementRefID = 3;
  const YXmlFragmentRefID = 4;
  const YXmlHookRefID = 5;
  const YXmlTextRefID = 6;

  /**
   * @private
   */
  class ContentType {
    /**
     * @param {AbstractType<YEvent>} type
     */
    constructor (type) {
      /**
       * @type {AbstractType<any>}
       */
      this.type = type;
    }
    /**
     * @return {number}
     */
    getLength () {
      return 1
    }
    /**
     * @return {Array<any>}
     */
    getContent () {
      return [this.type]
    }
    /**
     * @return {boolean}
     */
    isCountable () {
      return true
    }
    /**
     * @return {ContentType}
     */
    copy () {
      return new ContentType(this.type._copy())
    }
    /**
     * @param {number} offset
     * @return {ContentType}
     */
    splice (offset) {
      throw methodUnimplemented()
    }
    /**
     * @param {ContentType} right
     * @return {boolean}
     */
    mergeWith (right) {
      return false
    }
    /**
     * @param {Transaction} transaction
     * @param {Item} item
     */
    integrate (transaction, item) {
      this.type._integrate(transaction.doc, item);
    }
    /**
     * @param {Transaction} transaction
     */
    delete (transaction) {
      let item = this.type._start;
      while (item !== null) {
        if (!item.deleted) {
          item.delete(transaction);
        } else {
          // Whis will be gc'd later and we want to merge it if possible
          // We try to merge all deleted items after each transaction,
          // but we have no knowledge about that this needs to be merged
          // since it is not in transaction.ds. Hence we add it to transaction._mergeStructs
          transaction._mergeStructs.add(item.id);
        }
        item = item.right;
      }
      this.type._map.forEach(item => {
        if (!item.deleted) {
          item.delete(transaction);
        } else {
          // same as above
          transaction._mergeStructs.add(item.id);
        }
      });
      transaction.changed.delete(this.type);
    }
    /**
     * @param {StructStore} store
     */
    gc (store) {
      let item = this.type._start;
      while (item !== null) {
        item.gc(store, true);
        item = item.right;
      }
      this.type._start = null;
      this.type._map.forEach(/** @param {Item | null} item */ (item) => {
        while (item !== null) {
          item.gc(store, true);
          item = item.left;
        }
      });
      this.type._map = new Map();
    }
    /**
     * @param {encoding.Encoder} encoder
     * @param {number} offset
     */
    write (encoder, offset) {
      this.type._write(encoder);
    }
    /**
     * @return {number}
     */
    getRef () {
      return 7
    }
  }

  /**
   * @private
   *
   * @param {decoding.Decoder} decoder
   * @return {ContentType}
   */
  const readContentType = decoder => new ContentType(typeRefs[readVarUint(decoder)](decoder));

  /**
   * @param {StructStore} store
   * @param {ID} id
   * @return {{item:Item, diff:number}}
   */
  const followRedone = (store, id) => {
    /**
     * @type {ID|null}
     */
    let nextID = id;
    let diff = 0;
    let item;
    do {
      if (diff > 0) {
        nextID = createID(nextID.client, nextID.clock + diff);
      }
      item = getItem(store, nextID);
      diff = nextID.clock - item.id.clock;
      nextID = item.redone;
    } while (nextID !== null)
    return {
      item, diff
    }
  };

  /**
   * Make sure that neither item nor any of its parents is ever deleted.
   *
   * This property does not persist when storing it into a database or when
   * sending it to other peers
   *
   * @param {Item|null} item
   */
  const keepItem = item => {
    while (item !== null && !item.keep) {
      item.keep = true;
      item = item.parent._item;
    }
  };

  /**
   * Split leftItem into two items
   * @param {Transaction} transaction
   * @param {Item} leftItem
   * @param {number} diff
   * @return {Item}
   *
   * @function
   * @private
   */
  const splitItem = (transaction, leftItem, diff) => {
    const id = leftItem.id;
    // create rightItem
    const rightItem = new Item(
      createID(id.client, id.clock + diff),
      leftItem,
      createID(id.client, id.clock + diff - 1),
      leftItem.right,
      leftItem.rightOrigin,
      leftItem.parent,
      leftItem.parentSub,
      leftItem.content.splice(diff)
    );
    if (leftItem.deleted) {
      rightItem.deleted = true;
    }
    if (leftItem.keep) {
      rightItem.keep = true;
    }
    if (leftItem.redone !== null) {
      rightItem.redone = createID(leftItem.redone.client, leftItem.redone.clock + diff);
    }
    // update left (do not set leftItem.rightOrigin as it will lead to problems when syncing)
    leftItem.right = rightItem;
    // update right
    if (rightItem.right !== null) {
      rightItem.right.left = rightItem;
    }
    // right is more specific.
    transaction._mergeStructs.add(rightItem.id);
    // update parent._map
    if (rightItem.parentSub !== null && rightItem.right === null) {
      rightItem.parent._map.set(rightItem.parentSub, rightItem);
    }
    leftItem.length = diff;
    return rightItem
  };

  /**
   * Redoes the effect of this operation.
   *
   * @param {Transaction} transaction The Yjs instance.
   * @param {Item} item
   * @param {Set<Item>} redoitems
   *
   * @return {Item|null}
   *
   * @private
   */
  const redoItem = (transaction, item, redoitems) => {
    if (item.redone !== null) {
      return getItemCleanStart(transaction, transaction.doc.store, item.redone)
    }
    let parentItem = item.parent._item;
    /**
     * @type {Item|null}
     */
    let left;
    /**
     * @type {Item|null}
     */
    let right;
    if (item.parentSub === null) {
      // Is an array item. Insert at the old position
      left = item.left;
      right = item;
    } else {
      // Is a map item. Insert as current value
      left = item;
      while (left.right !== null) {
        left = left.right;
        if (left.id.client !== transaction.doc.clientID) {
          // It is not possible to redo this item because it conflicts with a
          // change from another client
          return null
        }
      }
      if (left.right !== null) {
        left = /** @type {Item} */ (item.parent._map.get(item.parentSub));
      }
      right = null;
    }
    // make sure that parent is redone
    if (parentItem !== null && parentItem.deleted === true && parentItem.redone === null) {
      // try to undo parent if it will be undone anyway
      if (!redoitems.has(parentItem) || redoItem(transaction, parentItem, redoitems) === null) {
        return null
      }
    }
    if (parentItem !== null && parentItem.redone !== null) {
      while (parentItem.redone !== null) {
        parentItem = getItemCleanStart(transaction, transaction.doc.store, parentItem.redone);
      }
      // find next cloned_redo items
      while (left !== null) {
        /**
         * @type {Item|null}
         */
        let leftTrace = left;
        // trace redone until parent matches
        while (leftTrace !== null && leftTrace.parent._item !== parentItem) {
          leftTrace = leftTrace.redone === null ? null : getItemCleanStart(transaction, transaction.doc.store, leftTrace.redone);
        }
        if (leftTrace !== null && leftTrace.parent._item === parentItem) {
          left = leftTrace;
          break
        }
        left = left.left;
      }
      while (right !== null) {
        /**
         * @type {Item|null}
         */
        let rightTrace = right;
        // trace redone until parent matches
        while (rightTrace !== null && rightTrace.parent._item !== parentItem) {
          rightTrace = rightTrace.redone === null ? null : getItemCleanStart(transaction, transaction.doc.store, rightTrace.redone);
        }
        if (rightTrace !== null && rightTrace.parent._item === parentItem) {
          right = rightTrace;
          break
        }
        right = right.right;
      }
    }
    const redoneItem = new Item(
      nextID(transaction),
      left, left === null ? null : left.lastId,
      right, right === null ? null : right.id,
      parentItem === null ? item.parent : /** @type {ContentType} */ (parentItem.content).type,
      item.parentSub,
      item.content.copy()
    );
    item.redone = redoneItem.id;
    keepItem(redoneItem);
    redoneItem.integrate(transaction);
    return redoneItem
  };

  /**
   * Abstract class that represents any content.
   */
  class Item extends AbstractStruct {
    /**
     * @param {ID} id
     * @param {Item | null} left
     * @param {ID | null} origin
     * @param {Item | null} right
     * @param {ID | null} rightOrigin
     * @param {AbstractType<any>} parent
     * @param {string | null} parentSub
     * @param {AbstractContent} content
     */
    constructor (id, left, origin, right, rightOrigin, parent, parentSub, content) {
      super(id, content.getLength());
      /**
       * The item that was originally to the left of this item.
       * @type {ID | null}
       * @readonly
       */
      this.origin = origin;
      /**
       * The item that is currently to the left of this item.
       * @type {Item | null}
       */
      this.left = left;
      /**
       * The item that is currently to the right of this item.
       * @type {Item | null}
       */
      this.right = right;
      /**
       * The item that was originally to the right of this item.
       * @readonly
       * @type {ID | null}
       */
      this.rightOrigin = rightOrigin;
      /**
       * The parent type.
       * @type {AbstractType<any>}
       * @readonly
       */
      this.parent = parent;
      /**
       * If the parent refers to this item with some kind of key (e.g. YMap, the
       * key is specified here. The key is then used to refer to the list in which
       * to insert this item. If `parentSub = null` type._start is the list in
       * which to insert to. Otherwise it is `parent._map`.
       * @type {String | null}
       * @readonly
       */
      this.parentSub = parentSub;
      /**
       * Whether this item was deleted or not.
       * @type {Boolean}
       */
      this.deleted = false;
      /**
       * If this type's effect is reundone this type refers to the type that undid
       * this operation.
       * @type {ID | null}
       */
      this.redone = null;
      /**
       * @type {AbstractContent}
       */
      this.content = content;
      this.length = content.getLength();
      this.countable = content.isCountable();
      /**
       * If true, do not garbage collect this Item.
       */
      this.keep = false;
    }

    /**
     * @param {Transaction} transaction
     * @private
     */
    integrate (transaction) {
      const store = transaction.doc.store;
      const id = this.id;
      const parent = this.parent;
      const parentSub = this.parentSub;
      const length = this.length;
      /**
       * @type {Item|null}
       */
      let o;
      // set o to the first conflicting item
      if (this.left !== null) {
        o = this.left.right;
      } else if (parentSub !== null) {
        o = parent._map.get(parentSub) || null;
        while (o !== null && o.left !== null) {
          o = o.left;
        }
      } else {
        o = parent._start;
      }
      // TODO: use something like DeleteSet here (a tree implementation would be best)
      /**
       * @type {Set<Item>}
       */
      const conflictingItems = new Set();
      /**
       * @type {Set<Item>}
       */
      const itemsBeforeOrigin = new Set();
      // Let c in conflictingItems, b in itemsBeforeOrigin
      // ***{origin}bbbb{this}{c,b}{c,b}{o}***
      // Note that conflictingItems is a subset of itemsBeforeOrigin
      while (o !== null && o !== this.right) {
        itemsBeforeOrigin.add(o);
        conflictingItems.add(o);
        if (compareIDs(this.origin, o.origin)) {
          // case 1
          if (o.id.client < id.client) {
            this.left = o;
            conflictingItems.clear();
          }
        } else if (o.origin !== null && itemsBeforeOrigin.has(getItem(store, o.origin))) {
          // case 2
          if (o.origin === null || !conflictingItems.has(getItem(store, o.origin))) {
            this.left = o;
            conflictingItems.clear();
          }
        } else {
          break
        }
        o = o.right;
      }
      // reconnect left/right + update parent map/start if necessary
      if (this.left !== null) {
        const right = this.left.right;
        this.right = right;
        this.left.right = this;
      } else {
        let r;
        if (parentSub !== null) {
          r = parent._map.get(parentSub) || null;
          while (r !== null && r.left !== null) {
            r = r.left;
          }
        } else {
          r = parent._start;
          parent._start = this;
        }
        this.right = r;
      }
      if (this.right !== null) {
        this.right.left = this;
      } else if (parentSub !== null) {
        // set as current parent value if right === null and this is parentSub
        parent._map.set(parentSub, this);
        if (this.left !== null) {
          // this is the current attribute value of parent. delete right
          this.left.delete(transaction);
        }
      }
      // adjust length of parent
      if (parentSub === null && this.countable && !this.deleted) {
        parent._length += length;
      }
      addStruct(store, this);
      this.content.integrate(transaction, this);
      // add parent to transaction.changed
      addChangedTypeToTransaction(transaction, parent, parentSub);
      if ((parent._item !== null && parent._item.deleted) || (this.right !== null && parentSub !== null)) {
        // delete if parent is deleted or if this is not the current attribute value of parent
        this.delete(transaction);
      }
    }

    /**
     * Returns the next non-deleted item
     * @private
     */
    get next () {
      let n = this.right;
      while (n !== null && n.deleted) {
        n = n.right;
      }
      return n
    }

    /**
     * Returns the previous non-deleted item
     * @private
     */
    get prev () {
      let n = this.left;
      while (n !== null && n.deleted) {
        n = n.left;
      }
      return n
    }

    /**
     * Computes the last content address of this Item.
     */
    get lastId () {
      return createID(this.id.client, this.id.clock + this.length - 1)
    }
    /**
     * Try to merge two items
     *
     * @param {Item} right
     * @return {boolean}
     */
    mergeWith (right) {
      if (
        compareIDs(right.origin, this.lastId) &&
        this.right === right &&
        compareIDs(this.rightOrigin, right.rightOrigin) &&
        this.id.client === right.id.client &&
        this.id.clock + this.length === right.id.clock &&
        this.deleted === right.deleted &&
        this.redone === null &&
        right.redone === null &&
        this.content.constructor === right.content.constructor &&
        this.content.mergeWith(right.content)
      ) {
        if (right.keep) {
          this.keep = true;
        }
        this.right = right.right;
        if (this.right !== null) {
          this.right.left = this;
        }
        this.length += right.length;
        return true
      }
      return false
    }

    /**
     * Mark this Item as deleted.
     *
     * @param {Transaction} transaction
     */
    delete (transaction) {
      if (!this.deleted) {
        const parent = this.parent;
        // adjust the length of parent
        if (this.countable && this.parentSub === null) {
          parent._length -= this.length;
        }
        this.deleted = true;
        addToDeleteSet(transaction.deleteSet, this.id, this.length);
        setIfUndefined(transaction.changed, parent, create$2).add(this.parentSub);
        this.content.delete(transaction);
      }
    }

    /**
     * @param {StructStore} store
     * @param {boolean} parentGCd
     *
     * @private
     */
    gc (store, parentGCd) {
      if (!this.deleted) {
        throw unexpectedCase()
      }
      this.content.gc(store);
      if (parentGCd) {
        replaceStruct(store, this, new GC(this.id, this.length));
      } else {
        this.content = new ContentDeleted(this.length);
      }
    }

    /**
     * Transform the properties of this type to binary and write it to an
     * BinaryEncoder.
     *
     * This is called when this Item is sent to a remote peer.
     *
     * @param {encoding.Encoder} encoder The encoder to write data to.
     * @param {number} offset
     *
     * @private
     */
    write (encoder, offset) {
      const origin = offset > 0 ? createID(this.id.client, this.id.clock + offset - 1) : this.origin;
      const rightOrigin = this.rightOrigin;
      const parentSub = this.parentSub;
      const info = (this.content.getRef() & BITS5) |
        (origin === null ? 0 : BIT8) | // origin is defined
        (rightOrigin === null ? 0 : BIT7) | // right origin is defined
        (parentSub === null ? 0 : BIT6); // parentSub is non-null
      writeUint8(encoder, info);
      if (origin !== null) {
        writeID(encoder, origin);
      }
      if (rightOrigin !== null) {
        writeID(encoder, rightOrigin);
      }
      if (origin === null && rightOrigin === null) {
        const parent = this.parent;
        if (parent._item === null) {
          // parent type on y._map
          // find the correct key
          const ykey = findRootTypeKey(parent);
          writeVarUint(encoder, 1); // write parentYKey
          writeVarString(encoder, ykey);
        } else {
          writeVarUint(encoder, 0); // write parent id
          writeID(encoder, parent._item.id);
        }
        if (parentSub !== null) {
          writeVarString(encoder, parentSub);
        }
      }
      this.content.write(encoder, offset);
    }
  }

  /**
   * @param {decoding.Decoder} decoder
   * @param {number} info
   */
  const readItemContent = (decoder, info) => contentRefs[info & BITS5](decoder);

  /**
   * A lookup map for reading Item content.
   *
   * @type {Array<function(decoding.Decoder):AbstractContent>}
   */
  const contentRefs = [
    () => { throw unexpectedCase() }, // GC is not ItemContent
    readContentDeleted,
    readContentJSON,
    readContentBinary,
    readContentString,
    readContentEmbed,
    readContentFormat,
    readContentType
  ];

  /**
   * @private
   */
  class ItemRef extends AbstractStructRef {
    /**
     * @param {decoding.Decoder} decoder
     * @param {ID} id
     * @param {number} info
     */
    constructor (decoder, id, info) {
      super(id);
      /**
       * The item that was originally to the left of this item.
       * @type {ID | null}
       */
      this.left = (info & BIT8) === BIT8 ? readID(decoder) : null;
      /**
       * The item that was originally to the right of this item.
       * @type {ID | null}
       */
      this.right = (info & BIT7) === BIT7 ? readID(decoder) : null;
      const canCopyParentInfo = (info & (BIT7 | BIT8)) === 0;
      const hasParentYKey = canCopyParentInfo ? readVarUint(decoder) === 1 : false;
      /**
       * If parent = null and neither left nor right are defined, then we know that `parent` is child of `y`
       * and we read the next string as parentYKey.
       * It indicates how we store/retrieve parent from `y.share`
       * @type {string|null}
       */
      this.parentYKey = canCopyParentInfo && hasParentYKey ? readVarString(decoder) : null;
      /**
       * The parent type.
       * @type {ID | null}
       */
      this.parent = canCopyParentInfo && !hasParentYKey ? readID(decoder) : null;
      /**
       * If the parent refers to this item with some kind of key (e.g. YMap, the
       * key is specified here. The key is then used to refer to the list in which
       * to insert this item. If `parentSub = null` type._start is the list in
       * which to insert to. Otherwise it is `parent._map`.
       * @type {String | null}
       */
      this.parentSub = canCopyParentInfo && (info & BIT6) === BIT6 ? readVarString(decoder) : null;
      const missing = this._missing;
      if (this.left !== null) {
        missing.push(this.left);
      }
      if (this.right !== null) {
        missing.push(this.right);
      }
      if (this.parent !== null) {
        missing.push(this.parent);
      }
      /**
       * @type {AbstractContent}
       */
      this.content = readItemContent(decoder, info);
      this.length = this.content.getLength();
    }
    /**
     * @param {Transaction} transaction
     * @param {StructStore} store
     * @param {number} offset
     * @return {Item|GC}
     */
    toStruct (transaction, store, offset) {
      if (offset > 0) {
        /**
         * @type {ID}
         */
        const id = this.id;
        this.id = createID(id.client, id.clock + offset);
        this.left = createID(this.id.client, this.id.clock - 1);
        this.content = this.content.splice(offset);
        this.length -= offset;
      }

      const left = this.left === null ? null : getItemCleanEnd(transaction, store, this.left);
      const right = this.right === null ? null : getItemCleanStart(transaction, store, this.right);
      let parent = null;
      let parentSub = this.parentSub;
      if (this.parent !== null) {
        const parentItem = getItem(store, this.parent);
        // Edge case: toStruct is called with an offset > 0. In this case left is defined.
        // Depending in which order structs arrive, left may be GC'd and the parent not
        // deleted. This is why we check if left is GC'd. Strictly we don't have
        // to check if right is GC'd, but we will in case we run into future issues
        if (!parentItem.deleted && (left === null || left.constructor !== GC) && (right === null || right.constructor !== GC)) {
          parent = /** @type {ContentType} */ (parentItem.content).type;
        }
      } else if (this.parentYKey !== null) {
        parent = transaction.doc.get(this.parentYKey);
      } else if (left !== null) {
        if (left.constructor !== GC) {
          parent = left.parent;
          parentSub = left.parentSub;
        }
      } else if (right !== null) {
        if (right.constructor !== GC) {
          parent = right.parent;
          parentSub = right.parentSub;
        }
      } else {
        throw unexpectedCase()
      }

      return parent === null
        ? new GC(this.id, this.length)
        : new Item(
          this.id,
          left,
          this.left,
          right,
          this.right,
          parent,
          parentSub,
          this.content
        )
    }
  }

  /**
   * @param {encoding.Encoder} encoder
   * @param {Array<AbstractStruct>} structs All structs by `client`
   * @param {number} client
   * @param {number} clock write structs starting with `ID(client,clock)`
   *
   * @function
   */
  const writeStructs = (encoder, structs, client, clock) => {
    // write first id
    const startNewStructs = findIndexSS(structs, clock);
    // write # encoded structs
    writeVarUint(encoder, structs.length - startNewStructs);
    writeID(encoder, createID(client, clock));
    const firstStruct = structs[startNewStructs];
    // write first struct with an offset
    firstStruct.write(encoder, clock - firstStruct.id.clock, 0);
    for (let i = startNewStructs + 1; i < structs.length; i++) {
      structs[i].write(encoder, 0, 0);
    }
  };

  /**
   * @param {decoding.Decoder} decoder
   * @param {number} numOfStructs
   * @param {ID} nextID
   * @return {Array<GCRef|ItemRef>}
   *
   * @private
   * @function
   */
  const readStructRefs = (decoder, numOfStructs, nextID) => {
    /**
     * @type {Array<GCRef|ItemRef>}
     */
    const refs = [];
    for (let i = 0; i < numOfStructs; i++) {
      const info = readUint8(decoder);
      const ref = (BITS5 & info) === 0 ? new GCRef(decoder, nextID, info) : new ItemRef(decoder, nextID, info);
      nextID = createID(nextID.client, nextID.clock + ref.length);
      refs.push(ref);
    }
    return refs
  };

  /**
   * @param {encoding.Encoder} encoder
   * @param {StructStore} store
   * @param {Map<number,number>} _sm
   *
   * @private
   * @function
   */
  const writeClientsStructs = (encoder, store, _sm) => {
    // we filter all valid _sm entries into sm
    const sm = new Map();
    _sm.forEach((clock, client) => {
      // only write if new structs are available
      if (getState(store, client) > clock) {
        sm.set(client, clock);
      }
    });
    getStateVector(store).forEach((clock, client) => {
      if (!_sm.has(client)) {
        sm.set(client, 0);
      }
    });
    // write # states that were updated
    writeVarUint(encoder, sm.size);
    sm.forEach((clock, client) => {
      // @ts-ignore
      writeStructs(encoder, store.clients.get(client), client, clock);
    });
  };

  /**
   * @param {decoding.Decoder} decoder The decoder object to read data from.
   * @return {Map<number,Array<GCRef|ItemRef>>}
   *
   * @private
   * @function
   */
  const readClientsStructRefs = decoder => {
    /**
     * @type {Map<number,Array<GCRef|ItemRef>>}
     */
    const clientRefs = new Map();
    const numOfStateUpdates = readVarUint(decoder);
    for (let i = 0; i < numOfStateUpdates; i++) {
      const numberOfStructs = readVarUint(decoder);
      const nextID = readID(decoder);
      const refs = readStructRefs(decoder, numberOfStructs, nextID);
      clientRefs.set(nextID.client, refs);
    }
    return clientRefs
  };

  /**
   * Resume computing structs generated by struct readers.
   *
   * While there is something to do, we integrate structs in this order
   * 1. top element on stack, if stack is not empty
   * 2. next element from current struct reader (if empty, use next struct reader)
   *
   * If struct causally depends on another struct (ref.missing), we put next reader of
   * `ref.id.client` on top of stack.
   *
   * At some point we find a struct that has no causal dependencies,
   * then we start emptying the stack.
   *
   * It is not possible to have circles: i.e. struct1 (from client1) depends on struct2 (from client2)
   * depends on struct3 (from client1). Therefore the max stack size is eqaul to `structReaders.length`.
   *
   * This method is implemented in a way so that we can resume computation if this update
   * causally depends on another update.
   *
   * @param {Transaction} transaction
   * @param {StructStore} store
   *
   * @private
   * @function
   */
  const resumeStructIntegration = (transaction, store) => {
    const stack = store.pendingStack;
    const clientsStructRefs = store.pendingClientsStructRefs;
    // iterate over all struct readers until we are done
    while (stack.length !== 0 || clientsStructRefs.size !== 0) {
      if (stack.length === 0) {
        // take any first struct from clientsStructRefs and put it on the stack
        const [client, structRefs] = clientsStructRefs.entries().next().value;
        stack.push(structRefs.refs[structRefs.i++]);
        if (structRefs.refs.length === structRefs.i) {
          clientsStructRefs.delete(client);
        }
      }
      const ref = stack[stack.length - 1];
      const m = ref._missing;
      const client = ref.id.client;
      const localClock = getState(store, client);
      const offset = ref.id.clock < localClock ? localClock - ref.id.clock : 0;
      if (ref.id.clock + offset !== localClock) {
        // A previous message from this client is missing
        // check if there is a pending structRef with a smaller clock and switch them
        const structRefs = clientsStructRefs.get(client);
        if (structRefs !== undefined) {
          const r = structRefs.refs[structRefs.i];
          if (r.id.clock < ref.id.clock) {
            // put ref with smaller clock on stack instead and continue
            structRefs.refs[structRefs.i] = ref;
            stack[stack.length - 1] = r;
            // sort the set because this approach might bring the list out of order
            structRefs.refs = structRefs.refs.slice(structRefs.i).sort((r1, r2) => r1.id.clock - r2.id.clock);
            structRefs.i = 0;
            continue
          }
        }
        // wait until missing struct is available
        return
      }
      while (m.length > 0) {
        const missing = m[m.length - 1];
        if (getState(store, missing.client) <= missing.clock) {
          const client = missing.client;
          // get the struct reader that has the missing struct
          const structRefs = clientsStructRefs.get(client);
          if (structRefs === undefined) {
            // This update message causally depends on another update message.
            return
          }
          stack.push(structRefs.refs[structRefs.i++]);
          if (structRefs.i === structRefs.refs.length) {
            clientsStructRefs.delete(client);
          }
          break
        }
        ref._missing.pop();
      }
      if (m.length === 0) {
        if (offset < ref.length) {
          ref.toStruct(transaction, store, offset).integrate(transaction);
        }
        stack.pop();
      }
    }
  };

  /**
   * @param {Transaction} transaction
   * @param {StructStore} store
   *
   * @private
   * @function
   */
  const tryResumePendingDeleteReaders = (transaction, store) => {
    const pendingReaders = store.pendingDeleteReaders;
    store.pendingDeleteReaders = [];
    for (let i = 0; i < pendingReaders.length; i++) {
      readDeleteSet(pendingReaders[i], transaction, store);
    }
  };

  /**
   * @param {encoding.Encoder} encoder
   * @param {Transaction} transaction
   *
   * @private
   * @function
   */
  const writeStructsFromTransaction = (encoder, transaction) => writeClientsStructs(encoder, transaction.doc.store, transaction.beforeState);

  /**
   * @param {StructStore} store
   * @param {Map<number, Array<GCRef|ItemRef>>} clientsStructsRefs
   *
   * @private
   * @function
   */
  const mergeReadStructsIntoPendingReads = (store, clientsStructsRefs) => {
    const pendingClientsStructRefs = store.pendingClientsStructRefs;
    for (const [client, structRefs] of clientsStructsRefs) {
      const pendingStructRefs = pendingClientsStructRefs.get(client);
      if (pendingStructRefs === undefined) {
        pendingClientsStructRefs.set(client, { refs: structRefs, i: 0 });
      } else {
        // merge into existing structRefs
        const merged = pendingStructRefs.i > 0 ? pendingStructRefs.refs.slice(pendingStructRefs.i) : pendingStructRefs.refs;
        for (let i = 0; i < structRefs.length; i++) {
          merged.push(structRefs[i]);
        }
        pendingStructRefs.i = 0;
        pendingStructRefs.refs = merged.sort((r1, r2) => r1.id.clock - r2.id.clock);
      }
    }
  };

  /**
   * Read the next Item in a Decoder and fill this Item with the read data.
   *
   * This is called when data is received from a remote peer.
   *
   * @param {decoding.Decoder} decoder The decoder object to read data from.
   * @param {Transaction} transaction
   * @param {StructStore} store
   *
   * @private
   * @function
   */
  const readStructs = (decoder, transaction, store) => {
    const clientsStructRefs = readClientsStructRefs(decoder);
    mergeReadStructsIntoPendingReads(store, clientsStructRefs);
    resumeStructIntegration(transaction, store);
    tryResumePendingDeleteReaders(transaction, store);
  };

  /**
   * Read and apply a document update.
   *
   * This function has the same effect as `applyUpdate` but accepts an decoder.
   *
   * @param {decoding.Decoder} decoder
   * @param {Doc} ydoc
   * @param {any} [transactionOrigin] This will be stored on `transaction.origin` and `.on('update', (update, origin))`
   *
   * @function
   */
  const readUpdate = (decoder, ydoc, transactionOrigin) =>
    ydoc.transact(transaction => {
      readStructs(decoder, transaction, ydoc.store);
      readDeleteSet(decoder, transaction, ydoc.store);
    }, transactionOrigin);

  /**
   * Apply a document update created by, for example, `y.on('update', update => ..)` or `update = encodeStateAsUpdate()`.
   *
   * This function has the same effect as `readUpdate` but accepts an Uint8Array instead of a Decoder.
   *
   * @param {Doc} ydoc
   * @param {Uint8Array} update
   * @param {any} [transactionOrigin] This will be stored on `transaction.origin` and `.on('update', (update, origin))`
   *
   * @function
   */
  const applyUpdate = (ydoc, update, transactionOrigin) =>
    readUpdate(createDecoder(update), ydoc, transactionOrigin);

  /**
   * Write all the document as a single update message. If you specify the state of the remote client (`targetStateVector`) it will
   * only write the operations that are missing.
   *
   * @param {encoding.Encoder} encoder
   * @param {Doc} doc
   * @param {Map<number,number>} [targetStateVector] The state of the target that receives the update. Leave empty to write all known structs
   *
   * @function
   */
  const writeStateAsUpdate = (encoder, doc, targetStateVector = new Map()) => {
    writeClientsStructs(encoder, doc.store, targetStateVector);
    writeDeleteSet(encoder, createDeleteSetFromStructStore(doc.store));
  };

  /**
   * Write all the document as a single update message that can be applied on the remote document. If you specify the state of the remote client (`targetState`) it will
   * only write the operations that are missing.
   *
   * Use `writeStateAsUpdate` instead if you are working with lib0/encoding.js#Encoder
   *
   * @param {Doc} doc
   * @param {Uint8Array} [encodedTargetStateVector] The state of the target that receives the update. Leave empty to write all known structs
   * @return {Uint8Array}
   *
   * @function
   */
  const encodeStateAsUpdate = (doc, encodedTargetStateVector) => {
    const encoder = createEncoder();
    const targetStateVector = encodedTargetStateVector == null ? new Map() : decodeStateVector(encodedTargetStateVector);
    writeStateAsUpdate(encoder, doc, targetStateVector);
    return toUint8Array(encoder)
  };

  /**
   * Read state vector from Decoder and return as Map
   *
   * @param {decoding.Decoder} decoder
   * @return {Map<number,number>} Maps `client` to the number next expected `clock` from that client.
   *
   * @function
   */
  const readStateVector = decoder => {
    const ss = new Map();
    const ssLength = readVarUint(decoder);
    for (let i = 0; i < ssLength; i++) {
      const client = readVarUint(decoder);
      const clock = readVarUint(decoder);
      ss.set(client, clock);
    }
    return ss
  };

  /**
   * Read decodedState and return State as Map.
   *
   * @param {Uint8Array} decodedState
   * @return {Map<number,number>} Maps `client` to the number next expected `clock` from that client.
   *
   * @function
   */
  const decodeStateVector = decodedState => readStateVector(createDecoder(decodedState));

  /**
   * Write State Vector to `lib0/encoding.js#Encoder`.
   *
   * @param {encoding.Encoder} encoder
   * @param {Doc} doc
   *
   * @function
   */
  const writeDocumentStateVector = (encoder, doc) => {
    writeVarUint(encoder, doc.store.clients.size);
    doc.store.clients.forEach((structs, client) => {
      const struct = structs[structs.length - 1];
      const id = struct.id;
      writeVarUint(encoder, id.client);
      writeVarUint(encoder, id.clock + struct.length);
    });
    return encoder
  };

  /**
   * Encode State as Uint8Array.
   *
   * @param {Doc} doc
   * @return {Uint8Array}
   *
   * @function
   */
  const encodeStateVector = doc => {
    const encoder = createEncoder();
    writeDocumentStateVector(encoder, doc);
    return toUint8Array(encoder)
  };

  /* eslint-env browser */

  /**
   * @typedef {Object} Channel
   * @property {Set<Function>} Channel.subs
   * @property {any} Channel.bc
   */

  /**
   * @type {Map<string, Channel>}
   */
  const channels = new Map();

  class LocalStoragePolyfill {
    /**
     * @param {string} room
     */
    constructor (room) {
      this.room = room;
      /**
       * @type {null|function({data:ArrayBuffer}):void}
       */
      this.onmessage = null;
      addEventListener('storage', e => e.key === room && this.onmessage !== null && this.onmessage({ data: fromBase64(e.newValue || '') }));
    }
    /**
     * @param {ArrayBuffer} buf
     */
    postMessage (buf) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.room, toBase64(createUint8ArrayFromArrayBuffer(buf)));
      }
    }
  }

  // Use BroadcastChannel or Polyfill
  const BC = typeof BroadcastChannel === 'undefined' ? LocalStoragePolyfill : BroadcastChannel;

  /**
   * @param {string} room
   * @return {Channel}
   */
  const getChannel = room =>
    setIfUndefined(channels, room, () => {
      const subs = new Set();
      const bc = new BC(room);
      /**
       * @param {{data:ArrayBuffer}} e
       */
      bc.onmessage = e => subs.forEach(sub => sub(e.data));
      return {
        bc, subs
      }
    });

  /**
   * @function
   * @param {string} room
   * @param {Function} f
   */
  const subscribe = (room, f) => getChannel(room).subs.add(f);

  /**
   * @function
   * @param {string} room
   * @param {Function} f
   */
  const unsubscribe = (room, f) => getChannel(room).subs.delete(f);

  /**
   * Publish data to all subscribers (including subscribers on this tab)
   *
   * @function
   * @param {string} room
   * @param {ArrayBuffer} data
   */
  const publish = (room, data) => {
    const c = getChannel(room);
    c.bc.postMessage(data);
    c.subs.forEach(sub => sub(data));
  };

  /**
   * @module sync-protocol
   */

  /**
   * @typedef {Map<number, number>} StateMap
   */

  /**
   * Core Yjs defines three message types:
   * • YjsSyncStep1: Includes the State Set of the sending client. When received, the client should reply with YjsSyncStep2.
   * • YjsSyncStep2: Includes all missing structs and the complete delete set. When received, the the client is assured that
   *   it received all information from the remote client.
   *
   * In a peer-to-peer network, you may want to introduce a SyncDone message type. Both parties should initiate the connection
   * with SyncStep1. When a client received SyncStep2, it should reply with SyncDone. When the local client received both
   * SyncStep2 and SyncDone, it is assured that it is synced to the remote client.
   *
   * In a client-server model, you want to handle this differently: The client should initiate the connection with SyncStep1.
   * When the server receives SyncStep1, it should reply with SyncStep2 immediately followed by SyncStep1. The client replies
   * with SyncStep2 when it receives SyncStep1. Optionally the server may send a SyncDone after it received SyncStep2, so the
   * client knows that the sync is finished.  There are two reasons for this more elaborated sync model: 1. This protocol can
   * easily be implemented on top of http and websockets. 2. The server shoul only reply to requests, and not initiate them.
   * Therefore it is necesarry that the client initiates the sync.
   *
   * Construction of a message:
   * [messageType : varUint, message definition..]
   *
   * Note: A message does not include information about the room name. This must to be handled by the upper layer protocol!
   *
   * stringify[messageType] stringifies a message definition (messageType is already read from the bufffer)
   */

  const messageYjsSyncStep1 = 0;
  const messageYjsSyncStep2 = 1;
  const messageYjsUpdate = 2;

  /**
   * Create a sync step 1 message based on the state of the current shared document.
   *
   * @param {encoding.Encoder} encoder
   * @param {Y.Doc} doc
   */
  const writeSyncStep1 = (encoder, doc) => {
    writeVarUint(encoder, messageYjsSyncStep1);
    const sv = encodeStateVector(doc);
    writeVarUint8Array(encoder, sv);
  };

  /**
   * @param {encoding.Encoder} encoder
   * @param {Y.Doc} doc
   * @param {Uint8Array} encodedStateVector
   */
  const writeSyncStep2 = (encoder, doc, encodedStateVector) => {
    writeVarUint(encoder, messageYjsSyncStep2);
    writeVarUint8Array(encoder, encodeStateAsUpdate(doc, encodedStateVector));
  };

  /**
   * Read SyncStep1 message and reply with SyncStep2.
   *
   * @param {decoding.Decoder} decoder The reply to the received message
   * @param {encoding.Encoder} encoder The received message
   * @param {Y.Doc} doc
   */
  const readSyncStep1 = (decoder, encoder, doc) =>
    writeSyncStep2(encoder, doc, readVarUint8Array(decoder));

  /**
   * Read and apply Structs and then DeleteStore to a y instance.
   *
   * @param {decoding.Decoder} decoder
   * @param {Y.Doc} doc
   * @param {any} transactionOrigin
   */
  const readSyncStep2 = (decoder, doc, transactionOrigin) => {
    applyUpdate(doc, readVarUint8Array(decoder), transactionOrigin);
  };

  /**
   * @param {encoding.Encoder} encoder
   * @param {Uint8Array} update
   */
  const writeUpdate = (encoder, update) => {
    writeVarUint(encoder, messageYjsUpdate);
    writeVarUint8Array(encoder, update);
  };

  /**
   * Read and apply Structs and then DeleteStore to a y instance.
   *
   * @param {decoding.Decoder} decoder
   * @param {Y.Doc} doc
   * @param {any} transactionOrigin
   */
  const readUpdate$1 = readSyncStep2;

  /**
   * @param {decoding.Decoder} decoder A message received from another client
   * @param {encoding.Encoder} encoder The reply message. Will not be sent if empty.
   * @param {Y.Doc} doc
   * @param {any} transactionOrigin
   */
  const readSyncMessage = (decoder, encoder, doc, transactionOrigin) => {
    const messageType = readVarUint(decoder);
    switch (messageType) {
      case messageYjsSyncStep1:
        readSyncStep1(decoder, encoder, doc);
        break
      case messageYjsSyncStep2:
        readSyncStep2(decoder, doc, transactionOrigin);
        break
      case messageYjsUpdate:
        readUpdate$1(decoder, doc, transactionOrigin);
        break
      default:
        throw new Error('Unknown message type')
    }
    return messageType
  };

  const messagePermissionDenied = 0;

  /**
   * @callback PermissionDeniedHandler
   * @param {any} y
   * @param {string} reason
   */

  /**
   *
   * @param {decoding.Decoder} decoder
   * @param {Y} y
   * @param {PermissionDeniedHandler} permissionDeniedHandler
   */
  const readAuthMessage = (decoder, y, permissionDeniedHandler) => {
    switch (readVarUint(decoder)) {
      case messagePermissionDenied: permissionDeniedHandler(y, readVarString(decoder));
    }
  };

  /**
   * @module awareness-protocol
   */

  const outdatedTimeout = 30000;

  /**
   * @typedef {Object} MetaClientState
   * @property {number} MetaClientState.clock
   * @property {number} MetaClientState.lastUpdated unix timestamp
   */

  /**
   * The Awareness class implements a simple shared state protocol that can be used for non-persistent data like awareness information
   * (cursor, username, status, ..). Each client can update its own local state and listen to state changes of
   * remote clients. Every client may set a state of a remote peer to `null` to mark the client as offline.
   *
   * Each client is identified by a unique client id (something we borrow from `doc.clientID`). A client can override
   * its own state by propagating a message with an increasing timestamp (`clock`). If such a message is received, it is
   * applied if the known state of that client is older than the new state (`clock < newClock`). If a client thinks that
   * a remote client is offline, it may propagate a message with
   * `{ clock: currentClientClock, state: null, client: remoteClient }`. If such a
   * message is received, and the known clock of that client equals the received clock, it will override the state with `null`.
   *
   * Before a client disconnects, it should propagate a `null` state with an updated clock.
   *
   * Awareness states must be updated every 30 seconds. Otherwise the Awareness instance will delete the client state.
   *
   * @extends {Observable<string>}
   */
  class Awareness extends Observable {
    /**
     * @param {Y.Doc} doc
     */
    constructor (doc) {
      super();
      this.doc = doc;
      /**
       * Maps from client id to client state
       * @type {Map<number, Object<string, any>>}
       */
      this.states = new Map();
      /**
       * @type {Map<number, MetaClientState>}
       */
      this.meta = new Map();
      this._checkInterval = setInterval(() => {
        const now = getUnixTime();
        if (this.getLocalState() !== null && outdatedTimeout / 2 <= now - /** @type {{lastUpdated:number}} */ (this.meta.get(doc.clientID)).lastUpdated) {
          // renew local clock
          this.setLocalState(this.getLocalState());
        }
        /**
         * @type {Array<number>}
         */
        const remove = [];
        this.meta.forEach((meta, clientid) => {
          if (outdatedTimeout <= now - meta.lastUpdated) {
            remove.push(clientid);
          }
        });
        if (remove.length > 0) {
          removeAwarenessStates(this, remove, 'timeout');
        }
      }, floor(outdatedTimeout / 10));
      doc.on('destroy', () => {
        this.destroy();
      });
    }
    destroy () {
      clearInterval(this._checkInterval);
    }
    /**
     * @return {Object<string,Object>|null}
     */
    getLocalState () {
      return this.states.get(this.doc.clientID) || null
    }
    /**
     * @param {Object<string,any>|null} state
     */
    setLocalState (state) {
      const clientID = this.doc.clientID;
      const currLocalMeta = this.meta.get(clientID);
      const clock = currLocalMeta === undefined ? 0 : currLocalMeta.clock + 1;
      if (state === null) {
        this.states.delete(clientID);
      } else {
        this.states.set(clientID, state);
      }
      this.meta.set(clientID, {
        clock,
        lastUpdated: getUnixTime()
      });
      const added = [];
      const updated = [];
      const removed = [];
      if (state === null) {
        removed.push(clientID);
      } else if (currLocalMeta === undefined) {
        added.push(clientID);
      } else {
        updated.push(clientID);
      }
      this.emit('change', [{ added, updated, removed }, 'local']);
    }
    /**
     * @param {string} field
     * @param {Object} value
     */
    setLocalStateField (field, value) {
      const state = this.getLocalState();
      if (state !== null) {
        state[field] = value;
        this.setLocalState(state);
      }
    }
    /**
     * @return {Map<number,Object<string,any>>}
     */
    getStates () {
      return this.states
    }
  }

  /**
   * Mark (remote) clients as inactive and remove them from the list of active peers.
   * This change will be propagated to remote clients.
   *
   * @param {Awareness} awareness
   * @param {Array<number>} clients
   * @param {any} origin
   */
  const removeAwarenessStates = (awareness, clients, origin) => {
    const removed = [];
    for (let i = 0; i < clients.length; i++) {
      const clientID = clients[i];
      if (awareness.states.has(clientID)) {
        awareness.states.delete(clientID);
        if (clientID === awareness.doc.clientID) {
          const curMeta = /** @type {MetaClientState} */ (awareness.meta.get(clientID));
          curMeta.clock++;
          curMeta.lastUpdated = getUnixTime();
          awareness.meta.set(clientID, curMeta);
        }
        removed.push(clientID);
      }
    }
    if (removed.length > 0) {
      awareness.emit('change', [{ added: [], updated: [], removed }, origin]);
    }
  };

  /**
   * @param {Awareness} awareness
   * @param {Array<number>} clients
   * @return {Uint8Array}
   */
  const encodeAwarenessUpdate = (awareness, clients) => {
    const len = clients.length;
    const encoder = createEncoder();
    writeVarUint(encoder, len);
    for (let i = 0; i < len; i++) {
      const clientID = clients[i];
      const state = awareness.states.get(clientID) || null;
      const clock = /** @type {MetaClientState} */ (awareness.meta.get(clientID)).clock;
      writeVarUint(encoder, clientID);
      writeVarUint(encoder, clock);
      writeVarString(encoder, JSON.stringify(state));
    }
    return toUint8Array(encoder)
  };

  /**
   * @param {Awareness} awareness
   * @param {Uint8Array} update
   * @param {any} origin This will be added to the emitted change event
   */
  const applyAwarenessUpdate = (awareness, update, origin) => {
    const decoder = createDecoder(update);
    const timestamp = getUnixTime();
    const added = [];
    const updated = [];
    const removed = [];
    const len = readVarUint(decoder);
    for (let i = 0; i < len; i++) {
      const clientID = readVarUint(decoder);
      const clock = readVarUint(decoder);
      const state = JSON.parse(readVarString(decoder));
      const clientMeta = awareness.meta.get(clientID);
      const uClock = clientMeta === undefined ? 0 : clientMeta.clock;
      if (uClock < clock || (uClock === clock && state === null && awareness.states.has(clientID))) {
        if (state === null) {
          awareness.states.delete(clientID);
        } else {
          awareness.states.set(clientID, state);
        }
        awareness.meta.set(clientID, {
          clock,
          lastUpdated: timestamp
        });
        if (clientMeta === undefined && state !== null) {
          added.push(clientID);
        } else if (clientMeta !== undefined && state === null) {
          removed.push(clientID);
        } else if (state !== null) {
          updated.push(clientID);
        }
      }
    }
    if (added.length > 0 || updated.length > 0 || removed.length > 0) {
      awareness.emit('change', [{
        added, updated, removed
      }, origin]);
    }
  };

  /**
   * @callback mutex
   * @param {function():void} cb Only executed when this mutex is not in the current stack
   * @param {function():void} [elseCb] Executed when this mutex is in the current stack
   */

  /**
   * Creates a mutual exclude function with the following property:
   *
   * @example
   * const mutex = createMutex()
   * mutex(() => {
   *   // This function is immediately executed
   *   mutex(() => {
   *     // This function is not executed, as the mutex is already active.
   *   })
   * })
   *
   * @return {mutex} A mutual exclude function
   * @public
   */
  const createMutex = () => {
    let token = true;
    return (f, g) => {
      if (token) {
        token = false;
        try {
          f();
        } finally {
          token = true;
        }
      } else if (g !== undefined) {
        g();
      }
    }
  };

  /*
  Unlike stated in the LICENSE file, it is not necessary to include the copyright notice and permission notice when you copy code from this file.
  */

  const messageSync = 0;
  const messageQueryAwareness = 3;
  const messageAwareness = 1;
  const messageAuth = 2;

  const reconnectTimeout = 3000;

  /**
   * Websocket Provider for Yjs. Creates a websocket connection to sync the shared document.
   * The document name is attached to the provided url. I.e. the following example
   * creates a websocket connection to http://localhost:1234/my-document-name
   *
   * @example
   *   import * as Y from 'yjs'
   *   import { WebsocketProvider } from 'y-websocket'
   *   const doc = new Y.Doc()
   *   const provider = new WebsocketProvider('http://localhost:1234', 'my-document-name', doc)
   *
   * @extends {Observable<string>}
   */
  class WebsocketProvider extends Observable {
    /**
     * @param {string} url
     * @param {string} roomname
     * @param {Y.Doc} doc
     */
    constructor (url, roomname, doc, awareness = new Awareness(doc)) {
      super();
      window.addEventListener('beforeunload', () => {
        removeAwarenessStates(this.awareness, [this.doc.clientID], null);
      });
      // ensure that url is always ends with /
      while (url[url.length - 1] === '/') {
        url = url.slice(0, url.length - 1);
      }
      this.url = url + '/' + roomname;
      this.roomname = roomname;
      this.doc = doc;
      /**
       * @type {Object<string,Object>}
       */
      this._localAwarenessState = {};
      this.awareness = awareness;
      this.wsconnected = false;
      this.mux = createMutex();
      /**
       * @type {WebSocket?}
       */
      this.ws = null;
      this.shouldReconnect = true;
      /**
       * @param {ArrayBuffer} data
       */
      this._bcSubscriber = data => {
        this.mux(() => {
          const encoder = readMessage(this, new Uint8Array(data));
          if (length(encoder) > 1) {
            publish(this.url, toUint8Array(encoder));
          }
        });
      };
      /**
       * Listens to Yjs updates and sends them to remote peers (ws and broadcastchannel)
       * @param {Uint8Array} update
       * @param {any} origin
       */
      this._updateHandler = (update, origin) => {
        if (origin !== this.ws || origin === null) {
          const encoder = createEncoder();
          writeVarUint(encoder, messageSync);
          writeUpdate(encoder, update);
          const buf = toUint8Array(encoder);
          if (this.wsconnected) {
            // @ts-ignore We know that wsconnected = true
            this.ws.send(buf);
          }
          this.mux(() => {
            publish(this.url, buf);
          });
        }
      };
      /**
       * @param {any} changed
       * @param {any} origin
       */
      this._awarenessUpdateHandler = ({ added, updated, removed }, origin) => {
        // only broadcast local awareness information and when ws connected
        const predicate = /** @param {number} id */ id => id === doc.clientID;
        if (added.some(predicate) || updated.some(predicate) || removed.some(predicate)) {
          const encoder = createEncoder();
          writeVarUint(encoder, messageAwareness);
          writeVarUint8Array(encoder, encodeAwarenessUpdate(awareness, [doc.clientID]));
          const buf = toUint8Array(encoder);
          if (this.wsconnected && this.ws !== null) {
            this.ws.send(buf);
          }
          this.mux(() => {
            publish(this.url, buf);
          });
        }
      };
      awareness.on('change', this._awarenessUpdateHandler);
      this.connect();
    }
    destroy () {
      this.disconnect();
      this.awareness.off('change', this._awarenessUpdateHandler);
      super.destroy();
    }
    disconnect () {
      this.shouldReconnect = false;
      if (this.ws !== null) {
        this.awareness.setLocalState(null);
        this.ws.close();
        unsubscribe(this.url, this._bcSubscriber);
        this.doc.off('update', this._updateHandler);
      }
    }
    connect () {
      this.shouldReconnect = true;
      if (!this.wsconnected && this.ws === null) {
        if (this.awareness.getLocalState() === null) {
          this.awareness.setLocalState({});
        }
        setupWS(this);
        subscribe(this.url, this._bcSubscriber);
        // send sync step1 to bc
        this.mux(() => {
          // write sync step 1
          const encoderSync = createEncoder();
          writeVarUint(encoderSync, messageSync);
          writeSyncStep1(encoderSync, this.doc);
          publish(this.url, toUint8Array(encoderSync));
          // write queryAwareness
          const encoderAwareness = createEncoder();
          writeVarUint(encoderAwareness, messageQueryAwareness);
          publish(this.url, toUint8Array(encoderAwareness));
        });
        this.doc.on('update', this._updateHandler);
      }
    }
  }

  /**
   * @param {WebsocketProvider} provider
   * @param {string} reason
   */
  const permissionDeniedHandler = (provider, reason) => console.warn(`Permission denied to access ${provider.url}.\n${reason}`);

  /**
   * @param {WebsocketProvider} provider
   * @param {Uint8Array} buf
   * @return {encoding.Encoder}
   */
  const readMessage = (provider, buf) => {
    const decoder = createDecoder(buf);
    const encoder = createEncoder();
    const messageType = readVarUint(decoder);
    switch (messageType) {
      case messageSync:
        writeVarUint(encoder, messageSync);
        readSyncMessage(decoder, encoder, provider.doc, provider.ws);
        break
      case messageQueryAwareness:
        writeVarUint(encoder, messageAwareness);
        writeVarUint8Array(encoder, encodeAwarenessUpdate(provider.awareness, Array.from(provider.awareness.getStates().keys())));
        break
      case messageAwareness:
        applyAwarenessUpdate(provider.awareness, readVarUint8Array(decoder), provider);
        break
      case messageAuth:
        readAuthMessage(decoder, provider, permissionDeniedHandler);
        break
      default:
        console.error('Unable to compute message');
        return encoder
    }
    return encoder
  };

  /**
   * @param {WebsocketProvider} provider
   */
  const setupWS = provider => {
    const websocket = new WebSocket(provider.url);
    websocket.binaryType = 'arraybuffer';
    provider.ws = websocket;
    websocket.onmessage = event => {
      const encoder = readMessage(provider, new Uint8Array(event.data));
      if (length(encoder) > 1) {
        websocket.send(toUint8Array(encoder));
      }
    };
    websocket.onclose = () => {
      provider.ws = null;
      if (provider.wsconnected) {
        provider.wsconnected = false;
        // update awareness (all users left)
        removeAwarenessStates(provider.awareness, Array.from(provider.awareness.getStates().keys()), provider);
        provider.emit('status', [{
          status: 'disconnected'
        }]);
      }
      if (provider.shouldReconnect) {
        setTimeout(setupWS, reconnectTimeout, provider, provider.url);
      }
    };
    websocket.onopen = () => {
      provider.wsconnected = true;
      provider.emit('status', [{
        status: 'connected'
      }]);
      // always send sync step 1 when connected
      const encoder = createEncoder();
      writeVarUint(encoder, messageSync);
      writeSyncStep1(encoder, provider.doc);
      websocket.send(toUint8Array(encoder));
      // by updating the local awareness state we trigger the event handler that propagates this information to other clients.
      provider.awareness.setLocalState(provider.awareness.getLocalState() || {});
    };
  };

  var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function unwrapExports (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  // ::- Persistent data structure representing an ordered mapping from
  // strings to values, with some convenient update methods.
  function OrderedMap(content) {
    this.content = content;
  }

  OrderedMap.prototype = {
    constructor: OrderedMap,

    find: function(key) {
      for (var i = 0; i < this.content.length; i += 2)
        if (this.content[i] === key) return i
      return -1
    },

    // :: (string) → ?any
    // Retrieve the value stored under `key`, or return undefined when
    // no such key exists.
    get: function(key) {
      var found = this.find(key);
      return found == -1 ? undefined : this.content[found + 1]
    },

    // :: (string, any, ?string) → OrderedMap
    // Create a new map by replacing the value of `key` with a new
    // value, or adding a binding to the end of the map. If `newKey` is
    // given, the key of the binding will be replaced with that key.
    update: function(key, value, newKey) {
      var self = newKey && newKey != key ? this.remove(newKey) : this;
      var found = self.find(key), content = self.content.slice();
      if (found == -1) {
        content.push(newKey || key, value);
      } else {
        content[found + 1] = value;
        if (newKey) content[found] = newKey;
      }
      return new OrderedMap(content)
    },

    // :: (string) → OrderedMap
    // Return a map with the given key removed, if it existed.
    remove: function(key) {
      var found = this.find(key);
      if (found == -1) return this
      var content = this.content.slice();
      content.splice(found, 2);
      return new OrderedMap(content)
    },

    // :: (string, any) → OrderedMap
    // Add a new key to the start of the map.
    addToStart: function(key, value) {
      return new OrderedMap([key, value].concat(this.remove(key).content))
    },

    // :: (string, any) → OrderedMap
    // Add a new key to the end of the map.
    addToEnd: function(key, value) {
      var content = this.remove(key).content.slice();
      content.push(key, value);
      return new OrderedMap(content)
    },

    // :: (string, string, any) → OrderedMap
    // Add a key after the given key. If `place` is not found, the new
    // key is added to the end.
    addBefore: function(place, key, value) {
      var without = this.remove(key), content = without.content.slice();
      var found = without.find(place);
      content.splice(found == -1 ? content.length : found, 0, key, value);
      return new OrderedMap(content)
    },

    // :: ((key: string, value: any))
    // Call the given function for each key/value pair in the map, in
    // order.
    forEach: function(f) {
      for (var i = 0; i < this.content.length; i += 2)
        f(this.content[i], this.content[i + 1]);
    },

    // :: (union<Object, OrderedMap>) → OrderedMap
    // Create a new map by prepending the keys in this map that don't
    // appear in `map` before the keys in `map`.
    prepend: function(map) {
      map = OrderedMap.from(map);
      if (!map.size) return this
      return new OrderedMap(map.content.concat(this.subtract(map).content))
    },

    // :: (union<Object, OrderedMap>) → OrderedMap
    // Create a new map by appending the keys in this map that don't
    // appear in `map` after the keys in `map`.
    append: function(map) {
      map = OrderedMap.from(map);
      if (!map.size) return this
      return new OrderedMap(this.subtract(map).content.concat(map.content))
    },

    // :: (union<Object, OrderedMap>) → OrderedMap
    // Create a map containing all the keys in this map that don't
    // appear in `map`.
    subtract: function(map) {
      var result = this;
      map = OrderedMap.from(map);
      for (var i = 0; i < map.content.length; i += 2)
        result = result.remove(map.content[i]);
      return result
    },

    // :: number
    // The amount of keys in this map.
    get size() {
      return this.content.length >> 1
    }
  };

  // :: (?union<Object, OrderedMap>) → OrderedMap
  // Return a map with the given content. If null, create an empty
  // map. If given an ordered map, return that map itself. If given an
  // object, create a map from the object's properties.
  OrderedMap.from = function(value) {
    if (value instanceof OrderedMap) return value
    var content = [];
    if (value) for (var prop in value) content.push(prop, value[prop]);
    return new OrderedMap(content)
  };

  var orderedmap = OrderedMap;

  var orderedmap$1 = /*#__PURE__*/Object.freeze({
    'default': orderedmap,
    __moduleExports: orderedmap
  });

  var require$$0 = ( orderedmap$1 && orderedmap ) || orderedmap$1;

  var dist = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, '__esModule', { value: true });

  function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

  var OrderedMap = _interopDefault(require$$0);

  function findDiffStart(a, b, pos) {
    for (var i = 0;; i++) {
      if (i == a.childCount || i == b.childCount)
        { return a.childCount == b.childCount ? null : pos }

      var childA = a.child(i), childB = b.child(i);
      if (childA == childB) { pos += childA.nodeSize; continue }

      if (!childA.sameMarkup(childB)) { return pos }

      if (childA.isText && childA.text != childB.text) {
        for (var j = 0; childA.text[j] == childB.text[j]; j++)
          { pos++; }
        return pos
      }
      if (childA.content.size || childB.content.size) {
        var inner = findDiffStart(childA.content, childB.content, pos + 1);
        if (inner != null) { return inner }
      }
      pos += childA.nodeSize;
    }
  }

  function findDiffEnd(a, b, posA, posB) {
    for (var iA = a.childCount, iB = b.childCount;;) {
      if (iA == 0 || iB == 0)
        { return iA == iB ? null : {a: posA, b: posB} }

      var childA = a.child(--iA), childB = b.child(--iB), size = childA.nodeSize;
      if (childA == childB) {
        posA -= size; posB -= size;
        continue
      }

      if (!childA.sameMarkup(childB)) { return {a: posA, b: posB} }

      if (childA.isText && childA.text != childB.text) {
        var same = 0, minSize = Math.min(childA.text.length, childB.text.length);
        while (same < minSize && childA.text[childA.text.length - same - 1] == childB.text[childB.text.length - same - 1]) {
          same++; posA--; posB--;
        }
        return {a: posA, b: posB}
      }
      if (childA.content.size || childB.content.size) {
        var inner = findDiffEnd(childA.content, childB.content, posA - 1, posB - 1);
        if (inner) { return inner }
      }
      posA -= size; posB -= size;
    }
  }

  // ::- A fragment represents a node's collection of child nodes.
  //
  // Like nodes, fragments are persistent data structures, and you
  // should not mutate them or their content. Rather, you create new
  // instances whenever needed. The API tries to make this easy.
  var Fragment = function Fragment(content, size) {
    var this$1 = this;

    this.content = content;
    // :: number
    // The size of the fragment, which is the total of the size of its
    // content nodes.
    this.size = size || 0;
    if (size == null) { for (var i = 0; i < content.length; i++)
      { this$1.size += content[i].nodeSize; } }
  };

  var prototypeAccessors$1 = { firstChild: {},lastChild: {},childCount: {} };

  // :: (number, number, (node: Node, start: number, parent: Node, index: number) → ?bool, ?number)
  // Invoke a callback for all descendant nodes between the given two
  // positions (relative to start of this fragment). Doesn't descend
  // into a node when the callback returns `false`.
  Fragment.prototype.nodesBetween = function nodesBetween (from, to, f, nodeStart, parent) {
      var this$1 = this;
      if ( nodeStart === void 0 ) nodeStart = 0;

    for (var i = 0, pos = 0; pos < to; i++) {
      var child = this$1.content[i], end = pos + child.nodeSize;
      if (end > from && f(child, nodeStart + pos, parent, i) !== false && child.content.size) {
        var start = pos + 1;
        child.nodesBetween(Math.max(0, from - start),
                           Math.min(child.content.size, to - start),
                           f, nodeStart + start);
      }
      pos = end;
    }
  };

  // :: ((node: Node, pos: number, parent: Node) → ?bool)
  // Call the given callback for every descendant node. The callback
  // may return `false` to prevent traversal of a given node's children.
  Fragment.prototype.descendants = function descendants (f) {
    this.nodesBetween(0, this.size, f);
  };

  // : (number, number, ?string, ?string) → string
  Fragment.prototype.textBetween = function textBetween (from, to, blockSeparator, leafText) {
    var text = "", separated = true;
    this.nodesBetween(from, to, function (node, pos) {
      if (node.isText) {
        text += node.text.slice(Math.max(from, pos) - pos, to - pos);
        separated = !blockSeparator;
      } else if (node.isLeaf && leafText) {
        text += leafText;
        separated = !blockSeparator;
      } else if (!separated && node.isBlock) {
        text += blockSeparator;
        separated = true;
      }
    }, 0);
    return text
  };

  // :: (Fragment) → Fragment
  // Create a new fragment containing the combined content of this
  // fragment and the other.
  Fragment.prototype.append = function append (other) {
    if (!other.size) { return this }
    if (!this.size) { return other }
    var last = this.lastChild, first = other.firstChild, content = this.content.slice(), i = 0;
    if (last.isText && last.sameMarkup(first)) {
      content[content.length - 1] = last.withText(last.text + first.text);
      i = 1;
    }
    for (; i < other.content.length; i++) { content.push(other.content[i]); }
    return new Fragment(content, this.size + other.size)
  };

  // :: (number, ?number) → Fragment
  // Cut out the sub-fragment between the two given positions.
  Fragment.prototype.cut = function cut (from, to) {
      var this$1 = this;

    if (to == null) { to = this.size; }
    if (from == 0 && to == this.size) { return this }
    var result = [], size = 0;
    if (to > from) { for (var i = 0, pos = 0; pos < to; i++) {
      var child = this$1.content[i], end = pos + child.nodeSize;
      if (end > from) {
        if (pos < from || end > to) {
          if (child.isText)
            { child = child.cut(Math.max(0, from - pos), Math.min(child.text.length, to - pos)); }
          else
            { child = child.cut(Math.max(0, from - pos - 1), Math.min(child.content.size, to - pos - 1)); }
        }
        result.push(child);
        size += child.nodeSize;
      }
      pos = end;
    } }
    return new Fragment(result, size)
  };

  Fragment.prototype.cutByIndex = function cutByIndex (from, to) {
    if (from == to) { return Fragment.empty }
    if (from == 0 && to == this.content.length) { return this }
    return new Fragment(this.content.slice(from, to))
  };

  // :: (number, Node) → Fragment
  // Create a new fragment in which the node at the given index is
  // replaced by the given node.
  Fragment.prototype.replaceChild = function replaceChild (index, node) {
    var current = this.content[index];
    if (current == node) { return this }
    var copy = this.content.slice();
    var size = this.size + node.nodeSize - current.nodeSize;
    copy[index] = node;
    return new Fragment(copy, size)
  };

  // : (Node) → Fragment
  // Create a new fragment by prepending the given node to this
  // fragment.
  Fragment.prototype.addToStart = function addToStart (node) {
    return new Fragment([node].concat(this.content), this.size + node.nodeSize)
  };

  // : (Node) → Fragment
  // Create a new fragment by appending the given node to this
  // fragment.
  Fragment.prototype.addToEnd = function addToEnd (node) {
    return new Fragment(this.content.concat(node), this.size + node.nodeSize)
  };

  // :: (Fragment) → bool
  // Compare this fragment to another one.
  Fragment.prototype.eq = function eq (other) {
      var this$1 = this;

    if (this.content.length != other.content.length) { return false }
    for (var i = 0; i < this.content.length; i++)
      { if (!this$1.content[i].eq(other.content[i])) { return false } }
    return true
  };

  // :: ?Node
  // The first child of the fragment, or `null` if it is empty.
  prototypeAccessors$1.firstChild.get = function () { return this.content.length ? this.content[0] : null };

  // :: ?Node
  // The last child of the fragment, or `null` if it is empty.
  prototypeAccessors$1.lastChild.get = function () { return this.content.length ? this.content[this.content.length - 1] : null };

  // :: number
  // The number of child nodes in this fragment.
  prototypeAccessors$1.childCount.get = function () { return this.content.length };

  // :: (number) → Node
  // Get the child node at the given index. Raise an error when the
  // index is out of range.
  Fragment.prototype.child = function child (index) {
    var found = this.content[index];
    if (!found) { throw new RangeError("Index " + index + " out of range for " + this) }
    return found
  };

  // :: (number) → ?Node
  // Get the child node at the given index, if it exists.
  Fragment.prototype.maybeChild = function maybeChild (index) {
    return this.content[index]
  };

  // :: ((node: Node, offset: number, index: number))
  // Call `f` for every child node, passing the node, its offset
  // into this parent node, and its index.
  Fragment.prototype.forEach = function forEach (f) {
      var this$1 = this;

    for (var i = 0, p = 0; i < this.content.length; i++) {
      var child = this$1.content[i];
      f(child, p, i);
      p += child.nodeSize;
    }
  };

  // :: (Fragment) → ?number
  // Find the first position at which this fragment and another
  // fragment differ, or `null` if they are the same.
  Fragment.prototype.findDiffStart = function findDiffStart$1 (other, pos) {
      if ( pos === void 0 ) pos = 0;

    return findDiffStart(this, other, pos)
  };

  // :: (Fragment) → ?{a: number, b: number}
  // Find the first position, searching from the end, at which this
  // fragment and the given fragment differ, or `null` if they are the
  // same. Since this position will not be the same in both nodes, an
  // object with two separate positions is returned.
  Fragment.prototype.findDiffEnd = function findDiffEnd$1 (other, pos, otherPos) {
      if ( pos === void 0 ) pos = this.size;
      if ( otherPos === void 0 ) otherPos = other.size;

    return findDiffEnd(this, other, pos, otherPos)
  };

  // : (number, ?number) → {index: number, offset: number}
  // Find the index and inner offset corresponding to a given relative
  // position in this fragment. The result object will be reused
  // (overwritten) the next time the function is called. (Not public.)
  Fragment.prototype.findIndex = function findIndex (pos, round) {
      var this$1 = this;
      if ( round === void 0 ) round = -1;

    if (pos == 0) { return retIndex(0, pos) }
    if (pos == this.size) { return retIndex(this.content.length, pos) }
    if (pos > this.size || pos < 0) { throw new RangeError(("Position " + pos + " outside of fragment (" + (this) + ")")) }
    for (var i = 0, curPos = 0;; i++) {
      var cur = this$1.child(i), end = curPos + cur.nodeSize;
      if (end >= pos) {
        if (end == pos || round > 0) { return retIndex(i + 1, end) }
        return retIndex(i, curPos)
      }
      curPos = end;
    }
  };

  // :: () → string
  // Return a debugging string that describes this fragment.
  Fragment.prototype.toString = function toString () { return "<" + this.toStringInner() + ">" };

  Fragment.prototype.toStringInner = function toStringInner () { return this.content.join(", ") };

  // :: () → ?Object
  // Create a JSON-serializeable representation of this fragment.
  Fragment.prototype.toJSON = function toJSON () {
    return this.content.length ? this.content.map(function (n) { return n.toJSON(); }) : null
  };

  // :: (Schema, ?Object) → Fragment
  // Deserialize a fragment from its JSON representation.
  Fragment.fromJSON = function fromJSON (schema, value) {
    if (!value) { return Fragment.empty }
    if (!Array.isArray(value)) { throw new RangeError("Invalid input for Fragment.fromJSON") }
    return new Fragment(value.map(schema.nodeFromJSON))
  };

  // :: ([Node]) → Fragment
  // Build a fragment from an array of nodes. Ensures that adjacent
  // text nodes with the same marks are joined together.
  Fragment.fromArray = function fromArray (array) {
    if (!array.length) { return Fragment.empty }
    var joined, size = 0;
    for (var i = 0; i < array.length; i++) {
      var node = array[i];
      size += node.nodeSize;
      if (i && node.isText && array[i - 1].sameMarkup(node)) {
        if (!joined) { joined = array.slice(0, i); }
        joined[joined.length - 1] = node.withText(joined[joined.length - 1].text + node.text);
      } else if (joined) {
        joined.push(node);
      }
    }
    return new Fragment(joined || array, size)
  };

  // :: (?union<Fragment, Node, [Node]>) → Fragment
  // Create a fragment from something that can be interpreted as a set
  // of nodes. For `null`, it returns the empty fragment. For a
  // fragment, the fragment itself. For a node or array of nodes, a
  // fragment containing those nodes.
  Fragment.from = function from (nodes) {
    if (!nodes) { return Fragment.empty }
    if (nodes instanceof Fragment) { return nodes }
    if (Array.isArray(nodes)) { return this.fromArray(nodes) }
    if (nodes.attrs) { return new Fragment([nodes], nodes.nodeSize) }
    throw new RangeError("Can not convert " + nodes + " to a Fragment" +
                         (nodes.nodesBetween ? " (looks like multiple versions of prosemirror-model were loaded)" : ""))
  };

  Object.defineProperties( Fragment.prototype, prototypeAccessors$1 );

  var found = {index: 0, offset: 0};
  function retIndex(index, offset) {
    found.index = index;
    found.offset = offset;
    return found
  }

  // :: Fragment
  // An empty fragment. Intended to be reused whenever a node doesn't
  // contain anything (rather than allocating a new empty fragment for
  // each leaf node).
  Fragment.empty = new Fragment([], 0);

  function compareDeep(a, b) {
    if (a === b) { return true }
    if (!(a && typeof a == "object") ||
        !(b && typeof b == "object")) { return false }
    var array = Array.isArray(a);
    if (Array.isArray(b) != array) { return false }
    if (array) {
      if (a.length != b.length) { return false }
      for (var i = 0; i < a.length; i++) { if (!compareDeep(a[i], b[i])) { return false } }
    } else {
      for (var p in a) { if (!(p in b) || !compareDeep(a[p], b[p])) { return false } }
      for (var p$1 in b) { if (!(p$1 in a)) { return false } }
    }
    return true
  }

  // ::- A mark is a piece of information that can be attached to a node,
  // such as it being emphasized, in code font, or a link. It has a type
  // and optionally a set of attributes that provide further information
  // (such as the target of the link). Marks are created through a
  // `Schema`, which controls which types exist and which
  // attributes they have.
  var Mark = function Mark(type, attrs) {
    // :: MarkType
    // The type of this mark.
    this.type = type;
    // :: Object
    // The attributes associated with this mark.
    this.attrs = attrs;
  };

  // :: ([Mark]) → [Mark]
  // Given a set of marks, create a new set which contains this one as
  // well, in the right position. If this mark is already in the set,
  // the set itself is returned. If any marks that are set to be
  // [exclusive](#model.MarkSpec.excludes) with this mark are present,
  // those are replaced by this one.
  Mark.prototype.addToSet = function addToSet (set) {
      var this$1 = this;

    var copy, placed = false;
    for (var i = 0; i < set.length; i++) {
      var other = set[i];
      if (this$1.eq(other)) { return set }
      if (this$1.type.excludes(other.type)) {
        if (!copy) { copy = set.slice(0, i); }
      } else if (other.type.excludes(this$1.type)) {
        return set
      } else {
        if (!placed && other.type.rank > this$1.type.rank) {
          if (!copy) { copy = set.slice(0, i); }
          copy.push(this$1);
          placed = true;
        }
        if (copy) { copy.push(other); }
      }
    }
    if (!copy) { copy = set.slice(); }
    if (!placed) { copy.push(this); }
    return copy
  };

  // :: ([Mark]) → [Mark]
  // Remove this mark from the given set, returning a new set. If this
  // mark is not in the set, the set itself is returned.
  Mark.prototype.removeFromSet = function removeFromSet (set) {
      var this$1 = this;

    for (var i = 0; i < set.length; i++)
      { if (this$1.eq(set[i]))
        { return set.slice(0, i).concat(set.slice(i + 1)) } }
    return set
  };

  // :: ([Mark]) → bool
  // Test whether this mark is in the given set of marks.
  Mark.prototype.isInSet = function isInSet (set) {
      var this$1 = this;

    for (var i = 0; i < set.length; i++)
      { if (this$1.eq(set[i])) { return true } }
    return false
  };

  // :: (Mark) → bool
  // Test whether this mark has the same type and attributes as
  // another mark.
  Mark.prototype.eq = function eq (other) {
    return this == other ||
      (this.type == other.type && compareDeep(this.attrs, other.attrs))
  };

  // :: () → Object
  // Convert this mark to a JSON-serializeable representation.
  Mark.prototype.toJSON = function toJSON () {
      var this$1 = this;

    var obj = {type: this.type.name};
    for (var _ in this$1.attrs) {
      obj.attrs = this$1.attrs;
      break
    }
    return obj
  };

  // :: (Schema, Object) → Mark
  Mark.fromJSON = function fromJSON (schema, json) {
    if (!json) { throw new RangeError("Invalid input for Mark.fromJSON") }
    var type = schema.marks[json.type];
    if (!type) { throw new RangeError(("There is no mark type " + (json.type) + " in this schema")) }
    return type.create(json.attrs)
  };

  // :: ([Mark], [Mark]) → bool
  // Test whether two sets of marks are identical.
  Mark.sameSet = function sameSet (a, b) {
    if (a == b) { return true }
    if (a.length != b.length) { return false }
    for (var i = 0; i < a.length; i++)
      { if (!a[i].eq(b[i])) { return false } }
    return true
  };

  // :: (?union<Mark, [Mark]>) → [Mark]
  // Create a properly sorted mark set from null, a single mark, or an
  // unsorted array of marks.
  Mark.setFrom = function setFrom (marks) {
    if (!marks || marks.length == 0) { return Mark.none }
    if (marks instanceof Mark) { return [marks] }
    var copy = marks.slice();
    copy.sort(function (a, b) { return a.type.rank - b.type.rank; });
    return copy
  };

  // :: [Mark] The empty set of marks.
  Mark.none = [];

  // ReplaceError:: class extends Error
  // Error type raised by [`Node.replace`](#model.Node.replace) when
  // given an invalid replacement.

  function ReplaceError(message) {
    var err = Error.call(this, message);
    err.__proto__ = ReplaceError.prototype;
    return err
  }

  ReplaceError.prototype = Object.create(Error.prototype);
  ReplaceError.prototype.constructor = ReplaceError;
  ReplaceError.prototype.name = "ReplaceError";

  // ::- A slice represents a piece cut out of a larger document. It
  // stores not only a fragment, but also the depth up to which nodes on
  // both side are ‘open’ (cut through).
  var Slice = function Slice(content, openStart, openEnd) {
    // :: Fragment The slice's content.
    this.content = content;
    // :: number The open depth at the start.
    this.openStart = openStart;
    // :: number The open depth at the end.
    this.openEnd = openEnd;
  };

  var prototypeAccessors$2 = { size: {} };

  // :: number
  // The size this slice would add when inserted into a document.
  prototypeAccessors$2.size.get = function () {
    return this.content.size - this.openStart - this.openEnd
  };

  Slice.prototype.insertAt = function insertAt (pos, fragment) {
    var content = insertInto(this.content, pos + this.openStart, fragment, null);
    return content && new Slice(content, this.openStart, this.openEnd)
  };

  Slice.prototype.removeBetween = function removeBetween (from, to) {
    return new Slice(removeRange(this.content, from + this.openStart, to + this.openStart), this.openStart, this.openEnd)
  };

  // :: (Slice) → bool
  // Tests whether this slice is equal to another slice.
  Slice.prototype.eq = function eq (other) {
    return this.content.eq(other.content) && this.openStart == other.openStart && this.openEnd == other.openEnd
  };

  Slice.prototype.toString = function toString () {
    return this.content + "(" + this.openStart + "," + this.openEnd + ")"
  };

  // :: () → ?Object
  // Convert a slice to a JSON-serializable representation.
  Slice.prototype.toJSON = function toJSON () {
    if (!this.content.size) { return null }
    var json = {content: this.content.toJSON()};
    if (this.openStart > 0) { json.openStart = this.openStart; }
    if (this.openEnd > 0) { json.openEnd = this.openEnd; }
    return json
  };

  // :: (Schema, ?Object) → Slice
  // Deserialize a slice from its JSON representation.
  Slice.fromJSON = function fromJSON (schema, json) {
    if (!json) { return Slice.empty }
    var openStart = json.openStart || 0, openEnd = json.openEnd || 0;
    if (typeof openStart != "number" || typeof openEnd != "number")
      { throw new RangeError("Invalid input for Slice.fromJSON") }
    return new Slice(Fragment.fromJSON(schema, json.content), json.openStart || 0, json.openEnd || 0)
  };

  // :: (Fragment, ?bool) → Slice
  // Create a slice from a fragment by taking the maximum possible
  // open value on both side of the fragment.
  Slice.maxOpen = function maxOpen (fragment, openIsolating) {
      if ( openIsolating === void 0 ) openIsolating=true;

    var openStart = 0, openEnd = 0;
    for (var n = fragment.firstChild; n && !n.isLeaf && (openIsolating || !n.type.spec.isolating); n = n.firstChild) { openStart++; }
    for (var n$1 = fragment.lastChild; n$1 && !n$1.isLeaf && (openIsolating || !n$1.type.spec.isolating); n$1 = n$1.lastChild) { openEnd++; }
    return new Slice(fragment, openStart, openEnd)
  };

  Object.defineProperties( Slice.prototype, prototypeAccessors$2 );

  function removeRange(content, from, to) {
    var ref = content.findIndex(from);
    var index = ref.index;
    var offset = ref.offset;
    var child = content.maybeChild(index);
    var ref$1 = content.findIndex(to);
    var indexTo = ref$1.index;
    var offsetTo = ref$1.offset;
    if (offset == from || child.isText) {
      if (offsetTo != to && !content.child(indexTo).isText) { throw new RangeError("Removing non-flat range") }
      return content.cut(0, from).append(content.cut(to))
    }
    if (index != indexTo) { throw new RangeError("Removing non-flat range") }
    return content.replaceChild(index, child.copy(removeRange(child.content, from - offset - 1, to - offset - 1)))
  }

  function insertInto(content, dist, insert, parent) {
    var ref = content.findIndex(dist);
    var index = ref.index;
    var offset = ref.offset;
    var child = content.maybeChild(index);
    if (offset == dist || child.isText) {
      if (parent && !parent.canReplace(index, index, insert)) { return null }
      return content.cut(0, dist).append(insert).append(content.cut(dist))
    }
    var inner = insertInto(child.content, dist - offset - 1, insert);
    return inner && content.replaceChild(index, child.copy(inner))
  }

  // :: Slice
  // The empty slice.
  Slice.empty = new Slice(Fragment.empty, 0, 0);

  function replace($from, $to, slice) {
    if (slice.openStart > $from.depth)
      { throw new ReplaceError("Inserted content deeper than insertion position") }
    if ($from.depth - slice.openStart != $to.depth - slice.openEnd)
      { throw new ReplaceError("Inconsistent open depths") }
    return replaceOuter($from, $to, slice, 0)
  }

  function replaceOuter($from, $to, slice, depth) {
    var index = $from.index(depth), node = $from.node(depth);
    if (index == $to.index(depth) && depth < $from.depth - slice.openStart) {
      var inner = replaceOuter($from, $to, slice, depth + 1);
      return node.copy(node.content.replaceChild(index, inner))
    } else if (!slice.content.size) {
      return close(node, replaceTwoWay($from, $to, depth))
    } else if (!slice.openStart && !slice.openEnd && $from.depth == depth && $to.depth == depth) { // Simple, flat case
      var parent = $from.parent, content = parent.content;
      return close(parent, content.cut(0, $from.parentOffset).append(slice.content).append(content.cut($to.parentOffset)))
    } else {
      var ref = prepareSliceForReplace(slice, $from);
      var start = ref.start;
      var end = ref.end;
      return close(node, replaceThreeWay($from, start, end, $to, depth))
    }
  }

  function checkJoin(main, sub) {
    if (!sub.type.compatibleContent(main.type))
      { throw new ReplaceError("Cannot join " + sub.type.name + " onto " + main.type.name) }
  }

  function joinable($before, $after, depth) {
    var node = $before.node(depth);
    checkJoin(node, $after.node(depth));
    return node
  }

  function addNode(child, target) {
    var last = target.length - 1;
    if (last >= 0 && child.isText && child.sameMarkup(target[last]))
      { target[last] = child.withText(target[last].text + child.text); }
    else
      { target.push(child); }
  }

  function addRange($start, $end, depth, target) {
    var node = ($end || $start).node(depth);
    var startIndex = 0, endIndex = $end ? $end.index(depth) : node.childCount;
    if ($start) {
      startIndex = $start.index(depth);
      if ($start.depth > depth) {
        startIndex++;
      } else if ($start.textOffset) {
        addNode($start.nodeAfter, target);
        startIndex++;
      }
    }
    for (var i = startIndex; i < endIndex; i++) { addNode(node.child(i), target); }
    if ($end && $end.depth == depth && $end.textOffset)
      { addNode($end.nodeBefore, target); }
  }

  function close(node, content) {
    if (!node.type.validContent(content))
      { throw new ReplaceError("Invalid content for node " + node.type.name) }
    return node.copy(content)
  }

  function replaceThreeWay($from, $start, $end, $to, depth) {
    var openStart = $from.depth > depth && joinable($from, $start, depth + 1);
    var openEnd = $to.depth > depth && joinable($end, $to, depth + 1);

    var content = [];
    addRange(null, $from, depth, content);
    if (openStart && openEnd && $start.index(depth) == $end.index(depth)) {
      checkJoin(openStart, openEnd);
      addNode(close(openStart, replaceThreeWay($from, $start, $end, $to, depth + 1)), content);
    } else {
      if (openStart)
        { addNode(close(openStart, replaceTwoWay($from, $start, depth + 1)), content); }
      addRange($start, $end, depth, content);
      if (openEnd)
        { addNode(close(openEnd, replaceTwoWay($end, $to, depth + 1)), content); }
    }
    addRange($to, null, depth, content);
    return new Fragment(content)
  }

  function replaceTwoWay($from, $to, depth) {
    var content = [];
    addRange(null, $from, depth, content);
    if ($from.depth > depth) {
      var type = joinable($from, $to, depth + 1);
      addNode(close(type, replaceTwoWay($from, $to, depth + 1)), content);
    }
    addRange($to, null, depth, content);
    return new Fragment(content)
  }

  function prepareSliceForReplace(slice, $along) {
    var extra = $along.depth - slice.openStart, parent = $along.node(extra);
    var node = parent.copy(slice.content);
    for (var i = extra - 1; i >= 0; i--)
      { node = $along.node(i).copy(Fragment.from(node)); }
    return {start: node.resolveNoCache(slice.openStart + extra),
            end: node.resolveNoCache(node.content.size - slice.openEnd - extra)}
  }

  // ::- You can [_resolve_](#model.Node.resolve) a position to get more
  // information about it. Objects of this class represent such a
  // resolved position, providing various pieces of context information,
  // and some helper methods.
  //
  // Throughout this interface, methods that take an optional `depth`
  // parameter will interpret undefined as `this.depth` and negative
  // numbers as `this.depth + value`.
  var ResolvedPos = function ResolvedPos(pos, path, parentOffset) {
    // :: number The position that was resolved.
    this.pos = pos;
    this.path = path;
    // :: number
    // The number of levels the parent node is from the root. If this
    // position points directly into the root node, it is 0. If it
    // points into a top-level paragraph, 1, and so on.
    this.depth = path.length / 3 - 1;
    // :: number The offset this position has into its parent node.
    this.parentOffset = parentOffset;
  };

  var prototypeAccessors$3 = { parent: {},doc: {},textOffset: {},nodeAfter: {},nodeBefore: {} };

  ResolvedPos.prototype.resolveDepth = function resolveDepth (val) {
    if (val == null) { return this.depth }
    if (val < 0) { return this.depth + val }
    return val
  };

  // :: Node
  // The parent node that the position points into. Note that even if
  // a position points into a text node, that node is not considered
  // the parent—text nodes are ‘flat’ in this model, and have no content.
  prototypeAccessors$3.parent.get = function () { return this.node(this.depth) };

  // :: Node
  // The root node in which the position was resolved.
  prototypeAccessors$3.doc.get = function () { return this.node(0) };

  // :: (?number) → Node
  // The ancestor node at the given level. `p.node(p.depth)` is the
  // same as `p.parent`.
  ResolvedPos.prototype.node = function node (depth) { return this.path[this.resolveDepth(depth) * 3] };

  // :: (?number) → number
  // The index into the ancestor at the given level. If this points at
  // the 3rd node in the 2nd paragraph on the top level, for example,
  // `p.index(0)` is 2 and `p.index(1)` is 3.
  ResolvedPos.prototype.index = function index (depth) { return this.path[this.resolveDepth(depth) * 3 + 1] };

  // :: (?number) → number
  // The index pointing after this position into the ancestor at the
  // given level.
  ResolvedPos.prototype.indexAfter = function indexAfter (depth) {
    depth = this.resolveDepth(depth);
    return this.index(depth) + (depth == this.depth && !this.textOffset ? 0 : 1)
  };

  // :: (?number) → number
  // The (absolute) position at the start of the node at the given
  // level.
  ResolvedPos.prototype.start = function start (depth) {
    depth = this.resolveDepth(depth);
    return depth == 0 ? 0 : this.path[depth * 3 - 1] + 1
  };

  // :: (?number) → number
  // The (absolute) position at the end of the node at the given
  // level.
  ResolvedPos.prototype.end = function end (depth) {
    depth = this.resolveDepth(depth);
    return this.start(depth) + this.node(depth).content.size
  };

  // :: (?number) → number
  // The (absolute) position directly before the wrapping node at the
  // given level, or, when `level` is `this.depth + 1`, the original
  // position.
  ResolvedPos.prototype.before = function before (depth) {
    depth = this.resolveDepth(depth);
    if (!depth) { throw new RangeError("There is no position before the top-level node") }
    return depth == this.depth + 1 ? this.pos : this.path[depth * 3 - 1]
  };

  // :: (?number) → number
  // The (absolute) position directly after the wrapping node at the
  // given level, or the original position when `level` is `this.depth + 1`.
  ResolvedPos.prototype.after = function after (depth) {
    depth = this.resolveDepth(depth);
    if (!depth) { throw new RangeError("There is no position after the top-level node") }
    return depth == this.depth + 1 ? this.pos : this.path[depth * 3 - 1] + this.path[depth * 3].nodeSize
  };

  // :: number
  // When this position points into a text node, this returns the
  // distance between the position and the start of the text node.
  // Will be zero for positions that point between nodes.
  prototypeAccessors$3.textOffset.get = function () { return this.pos - this.path[this.path.length - 1] };

  // :: ?Node
  // Get the node directly after the position, if any. If the position
  // points into a text node, only the part of that node after the
  // position is returned.
  prototypeAccessors$3.nodeAfter.get = function () {
    var parent = this.parent, index = this.index(this.depth);
    if (index == parent.childCount) { return null }
    var dOff = this.pos - this.path[this.path.length - 1], child = parent.child(index);
    return dOff ? parent.child(index).cut(dOff) : child
  };

  // :: ?Node
  // Get the node directly before the position, if any. If the
  // position points into a text node, only the part of that node
  // before the position is returned.
  prototypeAccessors$3.nodeBefore.get = function () {
    var index = this.index(this.depth);
    var dOff = this.pos - this.path[this.path.length - 1];
    if (dOff) { return this.parent.child(index).cut(0, dOff) }
    return index == 0 ? null : this.parent.child(index - 1)
  };

  // :: () → [Mark]
  // Get the marks at this position, factoring in the surrounding
  // marks' [`inclusive`](#model.MarkSpec.inclusive) property. If the
  // position is at the start of a non-empty node, the marks of the
  // node after it (if any) are returned.
  ResolvedPos.prototype.marks = function marks () {
    var parent = this.parent, index = this.index();

    // In an empty parent, return the empty array
    if (parent.content.size == 0) { return Mark.none }

    // When inside a text node, just return the text node's marks
    if (this.textOffset) { return parent.child(index).marks }

    var main = parent.maybeChild(index - 1), other = parent.maybeChild(index);
    // If the `after` flag is true of there is no node before, make
    // the node after this position the main reference.
    if (!main) { var tmp = main; main = other; other = tmp; }

    // Use all marks in the main node, except those that have
    // `inclusive` set to false and are not present in the other node.
    var marks = main.marks;
    for (var i = 0; i < marks.length; i++)
      { if (marks[i].type.spec.inclusive === false && (!other || !marks[i].isInSet(other.marks)))
        { marks = marks[i--].removeFromSet(marks); } }

    return marks
  };

  // :: (ResolvedPos) → ?[Mark]
  // Get the marks after the current position, if any, except those
  // that are non-inclusive and not present at position `$end`. This
  // is mostly useful for getting the set of marks to preserve after a
  // deletion. Will return `null` if this position is at the end of
  // its parent node or its parent node isn't a textblock (in which
  // case no marks should be preserved).
  ResolvedPos.prototype.marksAcross = function marksAcross ($end) {
    var after = this.parent.maybeChild(this.index());
    if (!after || !after.isInline) { return null }

    var marks = after.marks, next = $end.parent.maybeChild($end.index());
    for (var i = 0; i < marks.length; i++)
      { if (marks[i].type.spec.inclusive === false && (!next || !marks[i].isInSet(next.marks)))
        { marks = marks[i--].removeFromSet(marks); } }
    return marks
  };

  // :: (number) → number
  // The depth up to which this position and the given (non-resolved)
  // position share the same parent nodes.
  ResolvedPos.prototype.sharedDepth = function sharedDepth (pos) {
      var this$1 = this;

    for (var depth = this.depth; depth > 0; depth--)
      { if (this$1.start(depth) <= pos && this$1.end(depth) >= pos) { return depth } }
    return 0
  };

  // :: (?ResolvedPos, ?(Node) → bool) → ?NodeRange
  // Returns a range based on the place where this position and the
  // given position diverge around block content. If both point into
  // the same textblock, for example, a range around that textblock
  // will be returned. If they point into different blocks, the range
  // around those blocks in their shared ancestor is returned. You can
  // pass in an optional predicate that will be called with a parent
  // node to see if a range into that parent is acceptable.
  ResolvedPos.prototype.blockRange = function blockRange (other, pred) {
      var this$1 = this;
      if ( other === void 0 ) other = this;

    if (other.pos < this.pos) { return other.blockRange(this) }
    for (var d = this.depth - (this.parent.inlineContent || this.pos == other.pos ? 1 : 0); d >= 0; d--)
      { if (other.pos <= this$1.end(d) && (!pred || pred(this$1.node(d))))
        { return new NodeRange(this$1, other, d) } }
  };

  // :: (ResolvedPos) → bool
  // Query whether the given position shares the same parent node.
  ResolvedPos.prototype.sameParent = function sameParent (other) {
    return this.pos - this.parentOffset == other.pos - other.parentOffset
  };

  // :: (ResolvedPos) → ResolvedPos
  // Return the greater of this and the given position.
  ResolvedPos.prototype.max = function max (other) {
    return other.pos > this.pos ? other : this
  };

  // :: (ResolvedPos) → ResolvedPos
  // Return the smaller of this and the given position.
  ResolvedPos.prototype.min = function min (other) {
    return other.pos < this.pos ? other : this
  };

  ResolvedPos.prototype.toString = function toString () {
      var this$1 = this;

    var str = "";
    for (var i = 1; i <= this.depth; i++)
      { str += (str ? "/" : "") + this$1.node(i).type.name + "_" + this$1.index(i - 1); }
    return str + ":" + this.parentOffset
  };

  ResolvedPos.resolve = function resolve (doc, pos) {
    if (!(pos >= 0 && pos <= doc.content.size)) { throw new RangeError("Position " + pos + " out of range") }
    var path = [];
    var start = 0, parentOffset = pos;
    for (var node = doc;;) {
      var ref = node.content.findIndex(parentOffset);
        var index = ref.index;
        var offset = ref.offset;
      var rem = parentOffset - offset;
      path.push(node, index, start + offset);
      if (!rem) { break }
      node = node.child(index);
      if (node.isText) { break }
      parentOffset = rem - 1;
      start += offset + 1;
    }
    return new ResolvedPos(pos, path, parentOffset)
  };

  ResolvedPos.resolveCached = function resolveCached (doc, pos) {
    for (var i = 0; i < resolveCache.length; i++) {
      var cached = resolveCache[i];
      if (cached.pos == pos && cached.doc == doc) { return cached }
    }
    var result = resolveCache[resolveCachePos] = ResolvedPos.resolve(doc, pos);
    resolveCachePos = (resolveCachePos + 1) % resolveCacheSize;
    return result
  };

  Object.defineProperties( ResolvedPos.prototype, prototypeAccessors$3 );

  var resolveCache = [];
  var resolveCachePos = 0;
  var resolveCacheSize = 12;

  // ::- Represents a flat range of content, i.e. one that starts and
  // ends in the same node.
  var NodeRange = function NodeRange($from, $to, depth) {
    // :: ResolvedPos A resolved position along the start of the
    // content. May have a `depth` greater than this object's `depth`
    // property, since these are the positions that were used to
    // compute the range, not re-resolved positions directly at its
    // boundaries.
    this.$from = $from;
    // :: ResolvedPos A position along the end of the content. See
    // caveat for [`$from`](#model.NodeRange.$from).
    this.$to = $to;
    // :: number The depth of the node that this range points into.
    this.depth = depth;
  };

  var prototypeAccessors$1$1 = { start: {},end: {},parent: {},startIndex: {},endIndex: {} };

  // :: number The position at the start of the range.
  prototypeAccessors$1$1.start.get = function () { return this.$from.before(this.depth + 1) };
  // :: number The position at the end of the range.
  prototypeAccessors$1$1.end.get = function () { return this.$to.after(this.depth + 1) };

  // :: Node The parent node that the range points into.
  prototypeAccessors$1$1.parent.get = function () { return this.$from.node(this.depth) };
  // :: number The start index of the range in the parent node.
  prototypeAccessors$1$1.startIndex.get = function () { return this.$from.index(this.depth) };
  // :: number The end index of the range in the parent node.
  prototypeAccessors$1$1.endIndex.get = function () { return this.$to.indexAfter(this.depth) };

  Object.defineProperties( NodeRange.prototype, prototypeAccessors$1$1 );

  var emptyAttrs = Object.create(null);

  // ::- This class represents a node in the tree that makes up a
  // ProseMirror document. So a document is an instance of `Node`, with
  // children that are also instances of `Node`.
  //
  // Nodes are persistent data structures. Instead of changing them, you
  // create new ones with the content you want. Old ones keep pointing
  // at the old document shape. This is made cheaper by sharing
  // structure between the old and new data as much as possible, which a
  // tree shape like this (without back pointers) makes easy.
  //
  // **Do not** directly mutate the properties of a `Node` object. See
  // [the guide](/docs/guide/#doc) for more information.
  var Node = function Node(type, attrs, content, marks) {
    // :: NodeType
    // The type of node that this is.
    this.type = type;

    // :: Object
    // An object mapping attribute names to values. The kind of
    // attributes allowed and required are
    // [determined](#model.NodeSpec.attrs) by the node type.
    this.attrs = attrs;

    // :: Fragment
    // A container holding the node's children.
    this.content = content || Fragment.empty;

    // :: [Mark]
    // The marks (things like whether it is emphasized or part of a
    // link) applied to this node.
    this.marks = marks || Mark.none;
  };

  var prototypeAccessors = { nodeSize: {},childCount: {},textContent: {},firstChild: {},lastChild: {},isBlock: {},isTextblock: {},inlineContent: {},isInline: {},isText: {},isLeaf: {},isAtom: {} };

  // text:: ?string
  // For text nodes, this contains the node's text content.

  // :: number
  // The size of this node, as defined by the integer-based [indexing
  // scheme](/docs/guide/#doc.indexing). For text nodes, this is the
  // amount of characters. For other leaf nodes, it is one. For
  // non-leaf nodes, it is the size of the content plus two (the start
  // and end token).
  prototypeAccessors.nodeSize.get = function () { return this.isLeaf ? 1 : 2 + this.content.size };

  // :: number
  // The number of children that the node has.
  prototypeAccessors.childCount.get = function () { return this.content.childCount };

  // :: (number) → Node
  // Get the child node at the given index. Raises an error when the
  // index is out of range.
  Node.prototype.child = function child (index) { return this.content.child(index) };

  // :: (number) → ?Node
  // Get the child node at the given index, if it exists.
  Node.prototype.maybeChild = function maybeChild (index) { return this.content.maybeChild(index) };

  // :: ((node: Node, offset: number, index: number))
  // Call `f` for every child node, passing the node, its offset
  // into this parent node, and its index.
  Node.prototype.forEach = function forEach (f) { this.content.forEach(f); };

  // :: (number, number, (node: Node, pos: number, parent: Node, index: number) → ?bool, ?number)
  // Invoke a callback for all descendant nodes recursively between
  // the given two positions that are relative to start of this node's
  // content. The callback is invoked with the node, its
  // parent-relative position, its parent node, and its child index.
  // When the callback returns false for a given node, that node's
  // children will not be recursed over. The last parameter can be
  // used to specify a starting position to count from.
  Node.prototype.nodesBetween = function nodesBetween (from, to, f, startPos) {
      if ( startPos === void 0 ) startPos = 0;

    this.content.nodesBetween(from, to, f, startPos, this);
  };

  // :: ((node: Node, pos: number, parent: Node) → ?bool)
  // Call the given callback for every descendant node. Doesn't
  // descend into a node when the callback returns `false`.
  Node.prototype.descendants = function descendants (f) {
    this.nodesBetween(0, this.content.size, f);
  };

  // :: string
  // Concatenates all the text nodes found in this fragment and its
  // children.
  prototypeAccessors.textContent.get = function () { return this.textBetween(0, this.content.size, "") };

  // :: (number, number, ?string, ?string) → string
  // Get all text between positions `from` and `to`. When
  // `blockSeparator` is given, it will be inserted whenever a new
  // block node is started. When `leafText` is given, it'll be
  // inserted for every non-text leaf node encountered.
  Node.prototype.textBetween = function textBetween (from, to, blockSeparator, leafText) {
    return this.content.textBetween(from, to, blockSeparator, leafText)
  };

  // :: ?Node
  // Returns this node's first child, or `null` if there are no
  // children.
  prototypeAccessors.firstChild.get = function () { return this.content.firstChild };

  // :: ?Node
  // Returns this node's last child, or `null` if there are no
  // children.
  prototypeAccessors.lastChild.get = function () { return this.content.lastChild };

  // :: (Node) → bool
  // Test whether two nodes represent the same piece of document.
  Node.prototype.eq = function eq (other) {
    return this == other || (this.sameMarkup(other) && this.content.eq(other.content))
  };

  // :: (Node) → bool
  // Compare the markup (type, attributes, and marks) of this node to
  // those of another. Returns `true` if both have the same markup.
  Node.prototype.sameMarkup = function sameMarkup (other) {
    return this.hasMarkup(other.type, other.attrs, other.marks)
  };

  // :: (NodeType, ?Object, ?[Mark]) → bool
  // Check whether this node's markup correspond to the given type,
  // attributes, and marks.
  Node.prototype.hasMarkup = function hasMarkup (type, attrs, marks) {
    return this.type == type &&
      compareDeep(this.attrs, attrs || type.defaultAttrs || emptyAttrs) &&
      Mark.sameSet(this.marks, marks || Mark.none)
  };

  // :: (?Fragment) → Node
  // Create a new node with the same markup as this node, containing
  // the given content (or empty, if no content is given).
  Node.prototype.copy = function copy (content) {
      if ( content === void 0 ) content = null;

    if (content == this.content) { return this }
    return new this.constructor(this.type, this.attrs, content, this.marks)
  };

  // :: ([Mark]) → Node
  // Create a copy of this node, with the given set of marks instead
  // of the node's own marks.
  Node.prototype.mark = function mark (marks) {
    return marks == this.marks ? this : new this.constructor(this.type, this.attrs, this.content, marks)
  };

  // :: (number, ?number) → Node
  // Create a copy of this node with only the content between the
  // given positions. If `to` is not given, it defaults to the end of
  // the node.
  Node.prototype.cut = function cut (from, to) {
    if (from == 0 && to == this.content.size) { return this }
    return this.copy(this.content.cut(from, to))
  };

  // :: (number, ?number) → Slice
  // Cut out the part of the document between the given positions, and
  // return it as a `Slice` object.
  Node.prototype.slice = function slice (from, to, includeParents) {
      if ( to === void 0 ) to = this.content.size;
      if ( includeParents === void 0 ) includeParents = false;

    if (from == to) { return Slice.empty }

    var $from = this.resolve(from), $to = this.resolve(to);
    var depth = includeParents ? 0 : $from.sharedDepth(to);
    var start = $from.start(depth), node = $from.node(depth);
    var content = node.content.cut($from.pos - start, $to.pos - start);
    return new Slice(content, $from.depth - depth, $to.depth - depth)
  };

  // :: (number, number, Slice) → Node
  // Replace the part of the document between the given positions with
  // the given slice. The slice must 'fit', meaning its open sides
  // must be able to connect to the surrounding content, and its
  // content nodes must be valid children for the node they are placed
  // into. If any of this is violated, an error of type
  // [`ReplaceError`](#model.ReplaceError) is thrown.
  Node.prototype.replace = function replace$1 (from, to, slice) {
    return replace(this.resolve(from), this.resolve(to), slice)
  };

  // :: (number) → ?Node
  // Find the node directly after the given position.
  Node.prototype.nodeAt = function nodeAt (pos) {
    for (var node = this;;) {
      var ref = node.content.findIndex(pos);
        var index = ref.index;
        var offset = ref.offset;
      node = node.maybeChild(index);
      if (!node) { return null }
      if (offset == pos || node.isText) { return node }
      pos -= offset + 1;
    }
  };

  // :: (number) → {node: ?Node, index: number, offset: number}
  // Find the (direct) child node after the given offset, if any,
  // and return it along with its index and offset relative to this
  // node.
  Node.prototype.childAfter = function childAfter (pos) {
    var ref = this.content.findIndex(pos);
      var index = ref.index;
      var offset = ref.offset;
    return {node: this.content.maybeChild(index), index: index, offset: offset}
  };

  // :: (number) → {node: ?Node, index: number, offset: number}
  // Find the (direct) child node before the given offset, if any,
  // and return it along with its index and offset relative to this
  // node.
  Node.prototype.childBefore = function childBefore (pos) {
    if (pos == 0) { return {node: null, index: 0, offset: 0} }
    var ref = this.content.findIndex(pos);
      var index = ref.index;
      var offset = ref.offset;
    if (offset < pos) { return {node: this.content.child(index), index: index, offset: offset} }
    var node = this.content.child(index - 1);
    return {node: node, index: index - 1, offset: offset - node.nodeSize}
  };

  // :: (number) → ResolvedPos
  // Resolve the given position in the document, returning an
  // [object](#model.ResolvedPos) with information about its context.
  Node.prototype.resolve = function resolve (pos) { return ResolvedPos.resolveCached(this, pos) };

  Node.prototype.resolveNoCache = function resolveNoCache (pos) { return ResolvedPos.resolve(this, pos) };

  // :: (number, number, MarkType) → bool
  // Test whether a mark of the given type occurs in this document
  // between the two given positions.
  Node.prototype.rangeHasMark = function rangeHasMark (from, to, type) {
    var found = false;
    if (to > from) { this.nodesBetween(from, to, function (node) {
      if (type.isInSet(node.marks)) { found = true; }
      return !found
    }); }
    return found
  };

  // :: bool
  // True when this is a block (non-inline node)
  prototypeAccessors.isBlock.get = function () { return this.type.isBlock };

  // :: bool
  // True when this is a textblock node, a block node with inline
  // content.
  prototypeAccessors.isTextblock.get = function () { return this.type.isTextblock };

  // :: bool
  // True when this node allows inline content.
  prototypeAccessors.inlineContent.get = function () { return this.type.inlineContent };

  // :: bool
  // True when this is an inline node (a text node or a node that can
  // appear among text).
  prototypeAccessors.isInline.get = function () { return this.type.isInline };

  // :: bool
  // True when this is a text node.
  prototypeAccessors.isText.get = function () { return this.type.isText };

  // :: bool
  // True when this is a leaf node.
  prototypeAccessors.isLeaf.get = function () { return this.type.isLeaf };

  // :: bool
  // True when this is an atom, i.e. when it does not have directly
  // editable content. This is usually the same as `isLeaf`, but can
  // be configured with the [`atom` property](#model.NodeSpec.atom) on
  // a node's spec (typically used when the node is displayed as an
  // uneditable [node view](#view.NodeView)).
  prototypeAccessors.isAtom.get = function () { return this.type.isAtom };

  // :: () → string
  // Return a string representation of this node for debugging
  // purposes.
  Node.prototype.toString = function toString () {
    if (this.type.spec.toDebugString) { return this.type.spec.toDebugString(this) }
    var name = this.type.name;
    if (this.content.size)
      { name += "(" + this.content.toStringInner() + ")"; }
    return wrapMarks(this.marks, name)
  };

  // :: (number) → ContentMatch
  // Get the content match in this node at the given index.
  Node.prototype.contentMatchAt = function contentMatchAt (index) {
    var match = this.type.contentMatch.matchFragment(this.content, 0, index);
    if (!match) { throw new Error("Called contentMatchAt on a node with invalid content") }
    return match
  };

  // :: (number, number, ?Fragment, ?number, ?number) → bool
  // Test whether replacing the range between `from` and `to` (by
  // child index) with the given replacement fragment (which defaults
  // to the empty fragment) would leave the node's content valid. You
  // can optionally pass `start` and `end` indices into the
  // replacement fragment.
  Node.prototype.canReplace = function canReplace (from, to, replacement, start, end) {
      var this$1 = this;
      if ( replacement === void 0 ) replacement = Fragment.empty;
      if ( start === void 0 ) start = 0;
      if ( end === void 0 ) end = replacement.childCount;

    var one = this.contentMatchAt(from).matchFragment(replacement, start, end);
    var two = one && one.matchFragment(this.content, to);
    if (!two || !two.validEnd) { return false }
    for (var i = start; i < end; i++) { if (!this$1.type.allowsMarks(replacement.child(i).marks)) { return false } }
    return true
  };

  // :: (number, number, NodeType, ?[Mark]) → bool
  // Test whether replacing the range `from` to `to` (by index) with a
  // node of the given type would leave the node's content valid.
  Node.prototype.canReplaceWith = function canReplaceWith (from, to, type, marks) {
    if (marks && !this.type.allowsMarks(marks)) { return false }
    var start = this.contentMatchAt(from).matchType(type);
    var end = start && start.matchFragment(this.content, to);
    return end ? end.validEnd : false
  };

  // :: (Node) → bool
  // Test whether the given node's content could be appended to this
  // node. If that node is empty, this will only return true if there
  // is at least one node type that can appear in both nodes (to avoid
  // merging completely incompatible nodes).
  Node.prototype.canAppend = function canAppend (other) {
    if (other.content.size) { return this.canReplace(this.childCount, this.childCount, other.content) }
    else { return this.type.compatibleContent(other.type) }
  };

  // Unused. Left for backwards compatibility.
  Node.prototype.defaultContentType = function defaultContentType (at) {
    return this.contentMatchAt(at).defaultType
  };

  // :: ()
  // Check whether this node and its descendants conform to the
  // schema, and raise error when they do not.
  Node.prototype.check = function check () {
    if (!this.type.validContent(this.content))
      { throw new RangeError(("Invalid content for node " + (this.type.name) + ": " + (this.content.toString().slice(0, 50)))) }
    this.content.forEach(function (node) { return node.check(); });
  };

  // :: () → Object
  // Return a JSON-serializeable representation of this node.
  Node.prototype.toJSON = function toJSON () {
      var this$1 = this;

    var obj = {type: this.type.name};
    for (var _ in this$1.attrs) {
      obj.attrs = this$1.attrs;
      break
    }
    if (this.content.size)
      { obj.content = this.content.toJSON(); }
    if (this.marks.length)
      { obj.marks = this.marks.map(function (n) { return n.toJSON(); }); }
    return obj
  };

  // :: (Schema, Object) → Node
  // Deserialize a node from its JSON representation.
  Node.fromJSON = function fromJSON (schema, json) {
    if (!json) { throw new RangeError("Invalid input for Node.fromJSON") }
    var marks = null;
    if (json.marks) {
      if (!Array.isArray(json.marks)) { throw new RangeError("Invalid mark data for Node.fromJSON") }
      marks = json.marks.map(schema.markFromJSON);
    }
    if (json.type == "text") {
      if (typeof json.text != "string") { throw new RangeError("Invalid text node in JSON") }
      return schema.text(json.text, marks)
    }
    var content = Fragment.fromJSON(schema, json.content);
    return schema.nodeType(json.type).create(json.attrs, content, marks)
  };

  Object.defineProperties( Node.prototype, prototypeAccessors );

  var TextNode = (function (Node) {
    function TextNode(type, attrs, content, marks) {
      Node.call(this, type, attrs, null, marks);

      if (!content) { throw new RangeError("Empty text nodes are not allowed") }

      this.text = content;
    }

    if ( Node ) TextNode.__proto__ = Node;
    TextNode.prototype = Object.create( Node && Node.prototype );
    TextNode.prototype.constructor = TextNode;

    var prototypeAccessors$1 = { textContent: {},nodeSize: {} };

    TextNode.prototype.toString = function toString () {
      if (this.type.spec.toDebugString) { return this.type.spec.toDebugString(this) }
      return wrapMarks(this.marks, JSON.stringify(this.text))
    };

    prototypeAccessors$1.textContent.get = function () { return this.text };

    TextNode.prototype.textBetween = function textBetween (from, to) { return this.text.slice(from, to) };

    prototypeAccessors$1.nodeSize.get = function () { return this.text.length };

    TextNode.prototype.mark = function mark (marks) {
      return marks == this.marks ? this : new TextNode(this.type, this.attrs, this.text, marks)
    };

    TextNode.prototype.withText = function withText (text) {
      if (text == this.text) { return this }
      return new TextNode(this.type, this.attrs, text, this.marks)
    };

    TextNode.prototype.cut = function cut (from, to) {
      if ( from === void 0 ) from = 0;
      if ( to === void 0 ) to = this.text.length;

      if (from == 0 && to == this.text.length) { return this }
      return this.withText(this.text.slice(from, to))
    };

    TextNode.prototype.eq = function eq (other) {
      return this.sameMarkup(other) && this.text == other.text
    };

    TextNode.prototype.toJSON = function toJSON () {
      var base = Node.prototype.toJSON.call(this);
      base.text = this.text;
      return base
    };

    Object.defineProperties( TextNode.prototype, prototypeAccessors$1 );

    return TextNode;
  }(Node));

  function wrapMarks(marks, str) {
    for (var i = marks.length - 1; i >= 0; i--)
      { str = marks[i].type.name + "(" + str + ")"; }
    return str
  }

  // ::- Instances of this class represent a match state of a node
  // type's [content expression](#model.NodeSpec.content), and can be
  // used to find out whether further content matches here, and whether
  // a given position is a valid end of the node.
  var ContentMatch = function ContentMatch(validEnd) {
    // :: bool
    // True when this match state represents a valid end of the node.
    this.validEnd = validEnd;
    this.next = [];
    this.wrapCache = [];
  };

  var prototypeAccessors$5 = { inlineContent: {},defaultType: {},edgeCount: {} };

  ContentMatch.parse = function parse (string, nodeTypes) {
    var stream = new TokenStream(string, nodeTypes);
    if (stream.next == null) { return ContentMatch.empty }
    var expr = parseExpr(stream);
    if (stream.next) { stream.err("Unexpected trailing text"); }
    var match = dfa(nfa(expr));
    checkForDeadEnds(match, stream);
    return match
  };

  // :: (NodeType) → ?ContentMatch
  // Match a node type, returning a match after that node if
  // successful.
  ContentMatch.prototype.matchType = function matchType (type) {
      var this$1 = this;

    for (var i = 0; i < this.next.length; i += 2)
      { if (this$1.next[i] == type) { return this$1.next[i + 1] } }
    return null
  };

  // :: (Fragment, ?number, ?number) → ?ContentMatch
  // Try to match a fragment. Returns the resulting match when
  // successful.
  ContentMatch.prototype.matchFragment = function matchFragment (frag, start, end) {
      if ( start === void 0 ) start = 0;
      if ( end === void 0 ) end = frag.childCount;

    var cur = this;
    for (var i = start; cur && i < end; i++)
      { cur = cur.matchType(frag.child(i).type); }
    return cur
  };

  prototypeAccessors$5.inlineContent.get = function () {
    var first = this.next[0];
    return first ? first.isInline : false
  };

  // :: ?NodeType
  // Get the first matching node type at this match position that can
  // be generated.
  prototypeAccessors$5.defaultType.get = function () {
      var this$1 = this;

    for (var i = 0; i < this.next.length; i += 2) {
      var type = this$1.next[i];
      if (!(type.isText || type.hasRequiredAttrs())) { return type }
    }
  };

  ContentMatch.prototype.compatible = function compatible (other) {
      var this$1 = this;

    for (var i = 0; i < this.next.length; i += 2)
      { for (var j = 0; j < other.next.length; j += 2)
        { if (this$1.next[i] == other.next[j]) { return true } } }
    return false
  };

  // :: (Fragment, bool, ?number) → ?Fragment
  // Try to match the given fragment, and if that fails, see if it can
  // be made to match by inserting nodes in front of it. When
  // successful, return a fragment of inserted nodes (which may be
  // empty if nothing had to be inserted). When `toEnd` is true, only
  // return a fragment if the resulting match goes to the end of the
  // content expression.
  ContentMatch.prototype.fillBefore = function fillBefore (after, toEnd, startIndex) {
      if ( toEnd === void 0 ) toEnd = false;
      if ( startIndex === void 0 ) startIndex = 0;

    var seen = [this];
    function search(match, types) {
      var finished = match.matchFragment(after, startIndex);
      if (finished && (!toEnd || finished.validEnd))
        { return Fragment.from(types.map(function (tp) { return tp.createAndFill(); })) }

      for (var i = 0; i < match.next.length; i += 2) {
        var type = match.next[i], next = match.next[i + 1];
        if (!(type.isText || type.hasRequiredAttrs()) && seen.indexOf(next) == -1) {
          seen.push(next);
          var found = search(next, types.concat(type));
          if (found) { return found }
        }
      }
    }

    return search(this, [])
  };

  // :: (NodeType) → ?[NodeType]
  // Find a set of wrapping node types that would allow a node of the
  // given type to appear at this position. The result may be empty
  // (when it fits directly) and will be null when no such wrapping
  // exists.
  ContentMatch.prototype.findWrapping = function findWrapping (target) {
      var this$1 = this;

    for (var i = 0; i < this.wrapCache.length; i += 2)
      { if (this$1.wrapCache[i] == target) { return this$1.wrapCache[i + 1] } }
    var computed = this.computeWrapping(target);
    this.wrapCache.push(target, computed);
    return computed
  };

  ContentMatch.prototype.computeWrapping = function computeWrapping (target) {
    var seen = Object.create(null), active = [{match: this, type: null, via: null}];
    while (active.length) {
      var current = active.shift(), match = current.match;
      if (match.matchType(target)) {
        var result = [];
        for (var obj = current; obj.type; obj = obj.via)
          { result.push(obj.type); }
        return result.reverse()
      }
      for (var i = 0; i < match.next.length; i += 2) {
        var type = match.next[i];
        if (!type.isLeaf && !type.hasRequiredAttrs() && !(type.name in seen) && (!current.type || match.next[i + 1].validEnd)) {
          active.push({match: type.contentMatch, type: type, via: current});
          seen[type.name] = true;
        }
      }
    }
  };

  // :: number
  // The number of outgoing edges this node has in the finite
  // automaton that describes the content expression.
  prototypeAccessors$5.edgeCount.get = function () {
    return this.next.length >> 1
  };

  // :: (number) → {type: NodeType, next: ContentMatch}
  // Get the _n_th outgoing edge from this node in the finite
  // automaton that describes the content expression.
  ContentMatch.prototype.edge = function edge (n) {
    var i = n << 1;
    if (i > this.next.length) { throw new RangeError(("There's no " + n + "th edge in this content match")) }
    return {type: this.next[i], next: this.next[i + 1]}
  };

  ContentMatch.prototype.toString = function toString () {
    var seen = [];
    function scan(m) {
      seen.push(m);
      for (var i = 1; i < m.next.length; i += 2)
        { if (seen.indexOf(m.next[i]) == -1) { scan(m.next[i]); } }
    }
    scan(this);
    return seen.map(function (m, i) {
      var out = i + (m.validEnd ? "*" : " ") + " ";
      for (var i$1 = 0; i$1 < m.next.length; i$1 += 2)
        { out += (i$1 ? ", " : "") + m.next[i$1].name + "->" + seen.indexOf(m.next[i$1 + 1]); }
      return out
    }).join("\n")
  };

  Object.defineProperties( ContentMatch.prototype, prototypeAccessors$5 );

  ContentMatch.empty = new ContentMatch(true);

  var TokenStream = function TokenStream(string, nodeTypes) {
    this.string = string;
    this.nodeTypes = nodeTypes;
    this.inline = null;
    this.pos = 0;
    this.tokens = string.split(/\s*(?=\b|\W|$)/);
    if (this.tokens[this.tokens.length - 1] == "") { this.tokens.pop(); }
    if (this.tokens[0] == "") { this.tokens.unshift(); }
  };

  var prototypeAccessors$1$3 = { next: {} };

  prototypeAccessors$1$3.next.get = function () { return this.tokens[this.pos] };

  TokenStream.prototype.eat = function eat (tok) { return this.next == tok && (this.pos++ || true) };

  TokenStream.prototype.err = function err (str) { throw new SyntaxError(str + " (in content expression '" + this.string + "')") };

  Object.defineProperties( TokenStream.prototype, prototypeAccessors$1$3 );

  function parseExpr(stream) {
    var exprs = [];
    do { exprs.push(parseExprSeq(stream)); }
    while (stream.eat("|"))
    return exprs.length == 1 ? exprs[0] : {type: "choice", exprs: exprs}
  }

  function parseExprSeq(stream) {
    var exprs = [];
    do { exprs.push(parseExprSubscript(stream)); }
    while (stream.next && stream.next != ")" && stream.next != "|")
    return exprs.length == 1 ? exprs[0] : {type: "seq", exprs: exprs}
  }

  function parseExprSubscript(stream) {
    var expr = parseExprAtom(stream);
    for (;;) {
      if (stream.eat("+"))
        { expr = {type: "plus", expr: expr}; }
      else if (stream.eat("*"))
        { expr = {type: "star", expr: expr}; }
      else if (stream.eat("?"))
        { expr = {type: "opt", expr: expr}; }
      else if (stream.eat("{"))
        { expr = parseExprRange(stream, expr); }
      else { break }
    }
    return expr
  }

  function parseNum(stream) {
    if (/\D/.test(stream.next)) { stream.err("Expected number, got '" + stream.next + "'"); }
    var result = Number(stream.next);
    stream.pos++;
    return result
  }

  function parseExprRange(stream, expr) {
    var min = parseNum(stream), max = min;
    if (stream.eat(",")) {
      if (stream.next != "}") { max = parseNum(stream); }
      else { max = -1; }
    }
    if (!stream.eat("}")) { stream.err("Unclosed braced range"); }
    return {type: "range", min: min, max: max, expr: expr}
  }

  function resolveName(stream, name) {
    var types = stream.nodeTypes, type = types[name];
    if (type) { return [type] }
    var result = [];
    for (var typeName in types) {
      var type$1 = types[typeName];
      if (type$1.groups.indexOf(name) > -1) { result.push(type$1); }
    }
    if (result.length == 0) { stream.err("No node type or group '" + name + "' found"); }
    return result
  }

  function parseExprAtom(stream) {
    if (stream.eat("(")) {
      var expr = parseExpr(stream);
      if (!stream.eat(")")) { stream.err("Missing closing paren"); }
      return expr
    } else if (!/\W/.test(stream.next)) {
      var exprs = resolveName(stream, stream.next).map(function (type) {
        if (stream.inline == null) { stream.inline = type.isInline; }
        else if (stream.inline != type.isInline) { stream.err("Mixing inline and block content"); }
        return {type: "name", value: type}
      });
      stream.pos++;
      return exprs.length == 1 ? exprs[0] : {type: "choice", exprs: exprs}
    } else {
      stream.err("Unexpected token '" + stream.next + "'");
    }
  }

  // The code below helps compile a regular-expression-like language
  // into a deterministic finite automaton. For a good introduction to
  // these concepts, see https://swtch.com/~rsc/regexp/regexp1.html

  // : (Object) → [[{term: ?any, to: number}]]
  // Construct an NFA from an expression as returned by the parser. The
  // NFA is represented as an array of states, which are themselves
  // arrays of edges, which are `{term, to}` objects. The first state is
  // the entry state and the last node is the success state.
  //
  // Note that unlike typical NFAs, the edge ordering in this one is
  // significant, in that it is used to contruct filler content when
  // necessary.
  function nfa(expr) {
    var nfa = [[]];
    connect(compile(expr, 0), node());
    return nfa

    function node() { return nfa.push([]) - 1 }
    function edge(from, to, term) {
      var edge = {term: term, to: to};
      nfa[from].push(edge);
      return edge
    }
    function connect(edges, to) { edges.forEach(function (edge) { return edge.to = to; }); }

    function compile(expr, from) {
      if (expr.type == "choice") {
        return expr.exprs.reduce(function (out, expr) { return out.concat(compile(expr, from)); }, [])
      } else if (expr.type == "seq") {
        for (var i = 0;; i++) {
          var next = compile(expr.exprs[i], from);
          if (i == expr.exprs.length - 1) { return next }
          connect(next, from = node());
        }
      } else if (expr.type == "star") {
        var loop = node();
        edge(from, loop);
        connect(compile(expr.expr, loop), loop);
        return [edge(loop)]
      } else if (expr.type == "plus") {
        var loop$1 = node();
        connect(compile(expr.expr, from), loop$1);
        connect(compile(expr.expr, loop$1), loop$1);
        return [edge(loop$1)]
      } else if (expr.type == "opt") {
        return [edge(from)].concat(compile(expr.expr, from))
      } else if (expr.type == "range") {
        var cur = from;
        for (var i$1 = 0; i$1 < expr.min; i$1++) {
          var next$1 = node();
          connect(compile(expr.expr, cur), next$1);
          cur = next$1;
        }
        if (expr.max == -1) {
          connect(compile(expr.expr, cur), cur);
        } else {
          for (var i$2 = expr.min; i$2 < expr.max; i$2++) {
            var next$2 = node();
            edge(cur, next$2);
            connect(compile(expr.expr, cur), next$2);
            cur = next$2;
          }
        }
        return [edge(cur)]
      } else if (expr.type == "name") {
        return [edge(from, null, expr.value)]
      }
    }
  }

  function cmp(a, b) { return a - b }

  // Get the set of nodes reachable by null edges from `node`. Omit
  // nodes with only a single null-out-edge, since they may lead to
  // needless duplicated nodes.
  function nullFrom(nfa, node) {
    var result = [];
    scan(node);
    return result.sort(cmp)

    function scan(node) {
      var edges = nfa[node];
      if (edges.length == 1 && !edges[0].term) { return scan(edges[0].to) }
      result.push(node);
      for (var i = 0; i < edges.length; i++) {
        var ref = edges[i];
        var term = ref.term;
        var to = ref.to;
        if (!term && result.indexOf(to) == -1) { scan(to); }
      }
    }
  }

  // : ([[{term: ?any, to: number}]]) → ContentMatch
  // Compiles an NFA as produced by `nfa` into a DFA, modeled as a set
  // of state objects (`ContentMatch` instances) with transitions
  // between them.
  function dfa(nfa) {
    var labeled = Object.create(null);
    return explore(nullFrom(nfa, 0))

    function explore(states) {
      var out = [];
      states.forEach(function (node) {
        nfa[node].forEach(function (ref) {
          var term = ref.term;
          var to = ref.to;

          if (!term) { return }
          var known = out.indexOf(term), set = known > -1 && out[known + 1];
          nullFrom(nfa, to).forEach(function (node) {
            if (!set) { out.push(term, set = []); }
            if (set.indexOf(node) == -1) { set.push(node); }
          });
        });
      });
      var state = labeled[states.join(",")] = new ContentMatch(states.indexOf(nfa.length - 1) > -1);
      for (var i = 0; i < out.length; i += 2) {
        var states$1 = out[i + 1].sort(cmp);
        state.next.push(out[i], labeled[states$1.join(",")] || explore(states$1));
      }
      return state
    }
  }

  function checkForDeadEnds(match, stream) {
    for (var i = 0, work = [match]; i < work.length; i++) {
      var state = work[i], dead = !state.validEnd, nodes = [];
      for (var j = 0; j < state.next.length; j += 2) {
        var node = state.next[j], next = state.next[j + 1];
        nodes.push(node.name);
        if (dead && !(node.isText || node.hasRequiredAttrs())) { dead = false; }
        if (work.indexOf(next) == -1) { work.push(next); }
      }
      if (dead) { stream.err("Only non-generatable nodes (" + nodes.join(", ") + ") in a required position"); }
    }
  }

  // For node types where all attrs have a default value (or which don't
  // have any attributes), build up a single reusable default attribute
  // object, and use it for all nodes that don't specify specific
  // attributes.
  function defaultAttrs(attrs) {
    var defaults = Object.create(null);
    for (var attrName in attrs) {
      var attr = attrs[attrName];
      if (!attr.hasDefault) { return null }
      defaults[attrName] = attr.default;
    }
    return defaults
  }

  function computeAttrs(attrs, value) {
    var built = Object.create(null);
    for (var name in attrs) {
      var given = value && value[name];
      if (given === undefined) {
        var attr = attrs[name];
        if (attr.hasDefault) { given = attr.default; }
        else { throw new RangeError("No value supplied for attribute " + name) }
      }
      built[name] = given;
    }
    return built
  }

  function initAttrs(attrs) {
    var result = Object.create(null);
    if (attrs) { for (var name in attrs) { result[name] = new Attribute(attrs[name]); } }
    return result
  }

  // ::- Node types are objects allocated once per `Schema` and used to
  // [tag](#model.Node.type) `Node` instances. They contain information
  // about the node type, such as its name and what kind of node it
  // represents.
  var NodeType = function NodeType(name, schema, spec) {
    // :: string
    // The name the node type has in this schema.
    this.name = name;

    // :: Schema
    // A link back to the `Schema` the node type belongs to.
    this.schema = schema;

    // :: NodeSpec
    // The spec that this type is based on
    this.spec = spec;

    this.groups = spec.group ? spec.group.split(" ") : [];
    this.attrs = initAttrs(spec.attrs);

    this.defaultAttrs = defaultAttrs(this.attrs);

    // :: ContentMatch
    // The starting match of the node type's content expression.
    this.contentMatch = null;

    // : ?[MarkType]
    // The set of marks allowed in this node. `null` means all marks
    // are allowed.
    this.markSet = null;

    // :: bool
    // True if this node type has inline content.
    this.inlineContent = null;

    // :: bool
    // True if this is a block type
    this.isBlock = !(spec.inline || name == "text");

    // :: bool
    // True if this is the text node type.
    this.isText = name == "text";
  };

  var prototypeAccessors$4 = { isInline: {},isTextblock: {},isLeaf: {},isAtom: {} };

  // :: bool
  // True if this is an inline type.
  prototypeAccessors$4.isInline.get = function () { return !this.isBlock };

  // :: bool
  // True if this is a textblock type, a block that contains inline
  // content.
  prototypeAccessors$4.isTextblock.get = function () { return this.isBlock && this.inlineContent };

  // :: bool
  // True for node types that allow no content.
  prototypeAccessors$4.isLeaf.get = function () { return this.contentMatch == ContentMatch.empty };

  // :: bool
  // True when this node is an atom, i.e. when it does not have
  // directly editable content.
  prototypeAccessors$4.isAtom.get = function () { return this.isLeaf || this.spec.atom };

  NodeType.prototype.hasRequiredAttrs = function hasRequiredAttrs (ignore) {
      var this$1 = this;

    for (var n in this$1.attrs)
      { if (this$1.attrs[n].isRequired && (!ignore || !(n in ignore))) { return true } }
    return false
  };

  NodeType.prototype.compatibleContent = function compatibleContent (other) {
    return this == other || this.contentMatch.compatible(other.contentMatch)
  };

  NodeType.prototype.computeAttrs = function computeAttrs$1 (attrs) {
    if (!attrs && this.defaultAttrs) { return this.defaultAttrs }
    else { return computeAttrs(this.attrs, attrs) }
  };

  // :: (?Object, ?union<Fragment, Node, [Node]>, ?[Mark]) → Node
  // Create a `Node` of this type. The given attributes are
  // checked and defaulted (you can pass `null` to use the type's
  // defaults entirely, if no required attributes exist). `content`
  // may be a `Fragment`, a node, an array of nodes, or
  // `null`. Similarly `marks` may be `null` to default to the empty
  // set of marks.
  NodeType.prototype.create = function create (attrs, content, marks) {
    if (this.isText) { throw new Error("NodeType.create can't construct text nodes") }
    return new Node(this, this.computeAttrs(attrs), Fragment.from(content), Mark.setFrom(marks))
  };

  // :: (?Object, ?union<Fragment, Node, [Node]>, ?[Mark]) → Node
  // Like [`create`](#model.NodeType.create), but check the given content
  // against the node type's content restrictions, and throw an error
  // if it doesn't match.
  NodeType.prototype.createChecked = function createChecked (attrs, content, marks) {
    content = Fragment.from(content);
    if (!this.validContent(content))
      { throw new RangeError("Invalid content for node " + this.name) }
    return new Node(this, this.computeAttrs(attrs), content, Mark.setFrom(marks))
  };

  // :: (?Object, ?union<Fragment, Node, [Node]>, ?[Mark]) → ?Node
  // Like [`create`](#model.NodeType.create), but see if it is necessary to
  // add nodes to the start or end of the given fragment to make it
  // fit the node. If no fitting wrapping can be found, return null.
  // Note that, due to the fact that required nodes can always be
  // created, this will always succeed if you pass null or
  // `Fragment.empty` as content.
  NodeType.prototype.createAndFill = function createAndFill (attrs, content, marks) {
    attrs = this.computeAttrs(attrs);
    content = Fragment.from(content);
    if (content.size) {
      var before = this.contentMatch.fillBefore(content);
      if (!before) { return null }
      content = before.append(content);
    }
    var after = this.contentMatch.matchFragment(content).fillBefore(Fragment.empty, true);
    if (!after) { return null }
    return new Node(this, attrs, content.append(after), Mark.setFrom(marks))
  };

  // :: (Fragment) → bool
  // Returns true if the given fragment is valid content for this node
  // type with the given attributes.
  NodeType.prototype.validContent = function validContent (content) {
      var this$1 = this;

    var result = this.contentMatch.matchFragment(content);
    if (!result || !result.validEnd) { return false }
    for (var i = 0; i < content.childCount; i++)
      { if (!this$1.allowsMarks(content.child(i).marks)) { return false } }
    return true
  };

  // :: (MarkType) → bool
  // Check whether the given mark type is allowed in this node.
  NodeType.prototype.allowsMarkType = function allowsMarkType (markType) {
    return this.markSet == null || this.markSet.indexOf(markType) > -1
  };

  // :: ([Mark]) → bool
  // Test whether the given set of marks are allowed in this node.
  NodeType.prototype.allowsMarks = function allowsMarks (marks) {
      var this$1 = this;

    if (this.markSet == null) { return true }
    for (var i = 0; i < marks.length; i++) { if (!this$1.allowsMarkType(marks[i].type)) { return false } }
    return true
  };

  // :: ([Mark]) → [Mark]
  // Removes the marks that are not allowed in this node from the given set.
  NodeType.prototype.allowedMarks = function allowedMarks (marks) {
      var this$1 = this;

    if (this.markSet == null) { return marks }
    var copy;
    for (var i = 0; i < marks.length; i++) {
      if (!this$1.allowsMarkType(marks[i].type)) {
        if (!copy) { copy = marks.slice(0, i); }
      } else if (copy) {
        copy.push(marks[i]);
      }
    }
    return !copy ? marks : copy.length ? copy : Mark.empty
  };

  NodeType.compile = function compile (nodes, schema) {
    var result = Object.create(null);
    nodes.forEach(function (name, spec) { return result[name] = new NodeType(name, schema, spec); });

    var topType = schema.spec.topNode || "doc";
    if (!result[topType]) { throw new RangeError("Schema is missing its top node type ('" + topType + "')") }
    if (!result.text) { throw new RangeError("Every schema needs a 'text' type") }
    for (var _ in result.text.attrs) { throw new RangeError("The text node type should not have attributes") }

    return result
  };

  Object.defineProperties( NodeType.prototype, prototypeAccessors$4 );

  // Attribute descriptors

  var Attribute = function Attribute(options) {
    this.hasDefault = Object.prototype.hasOwnProperty.call(options, "default");
    this.default = options.default;
  };

  var prototypeAccessors$1$2 = { isRequired: {} };

  prototypeAccessors$1$2.isRequired.get = function () {
    return !this.hasDefault
  };

  Object.defineProperties( Attribute.prototype, prototypeAccessors$1$2 );

  // Marks

  // ::- Like nodes, marks (which are associated with nodes to signify
  // things like emphasis or being part of a link) are
  // [tagged](#model.Mark.type) with type objects, which are
  // instantiated once per `Schema`.
  var MarkType = function MarkType(name, rank, schema, spec) {
    // :: string
    // The name of the mark type.
    this.name = name;

    // :: Schema
    // The schema that this mark type instance is part of.
    this.schema = schema;

    // :: MarkSpec
    // The spec on which the type is based.
    this.spec = spec;

    this.attrs = initAttrs(spec.attrs);

    this.rank = rank;
    this.excluded = null;
    var defaults = defaultAttrs(this.attrs);
    this.instance = defaults && new Mark(this, defaults);
  };

  // :: (?Object) → Mark
  // Create a mark of this type. `attrs` may be `null` or an object
  // containing only some of the mark's attributes. The others, if
  // they have defaults, will be added.
  MarkType.prototype.create = function create (attrs) {
    if (!attrs && this.instance) { return this.instance }
    return new Mark(this, computeAttrs(this.attrs, attrs))
  };

  MarkType.compile = function compile (marks, schema) {
    var result = Object.create(null), rank = 0;
    marks.forEach(function (name, spec) { return result[name] = new MarkType(name, rank++, schema, spec); });
    return result
  };

  // :: ([Mark]) → [Mark]
  // When there is a mark of this type in the given set, a new set
  // without it is returned. Otherwise, the input set is returned.
  MarkType.prototype.removeFromSet = function removeFromSet (set) {
      var this$1 = this;

    for (var i = 0; i < set.length; i++)
      { if (set[i].type == this$1)
        { return set.slice(0, i).concat(set.slice(i + 1)) } }
    return set
  };

  // :: ([Mark]) → ?Mark
  // Tests whether there is a mark of this type in the given set.
  MarkType.prototype.isInSet = function isInSet (set) {
      var this$1 = this;

    for (var i = 0; i < set.length; i++)
      { if (set[i].type == this$1) { return set[i] } }
  };

  // :: (MarkType) → bool
  // Queries whether a given mark type is
  // [excluded](#model.MarkSpec.excludes) by this one.
  MarkType.prototype.excludes = function excludes (other) {
    return this.excluded.indexOf(other) > -1
  };

  // SchemaSpec:: interface
  // An object describing a schema, as passed to the [`Schema`](#model.Schema)
  // constructor.
  //
  //   nodes:: union<Object<NodeSpec>, OrderedMap<NodeSpec>>
  //   The node types in this schema. Maps names to
  //   [`NodeSpec`](#model.NodeSpec) objects that describe the node type
  //   associated with that name. Their order is significant—it
  //   determines which [parse rules](#model.NodeSpec.parseDOM) take
  //   precedence by default, and which nodes come first in a given
  //   [group](#model.NodeSpec.group).
  //
  //   marks:: ?union<Object<MarkSpec>, OrderedMap<MarkSpec>>
  //   The mark types that exist in this schema. The order in which they
  //   are provided determines the order in which [mark
  //   sets](#model.Mark.addToSet) are sorted and in which [parse
  //   rules](#model.MarkSpec.parseDOM) are tried.
  //
  //   topNode:: ?string
  //   The name of the default top-level node for the schema. Defaults
  //   to `"doc"`.

  // NodeSpec:: interface
  //
  //   content:: ?string
  //   The content expression for this node, as described in the [schema
  //   guide](/docs/guide/#schema.content_expressions). When not given,
  //   the node does not allow any content.
  //
  //   marks:: ?string
  //   The marks that are allowed inside of this node. May be a
  //   space-separated string referring to mark names or groups, `"_"`
  //   to explicitly allow all marks, or `""` to disallow marks. When
  //   not given, nodes with inline content default to allowing all
  //   marks, other nodes default to not allowing marks.
  //
  //   group:: ?string
  //   The group or space-separated groups to which this node belongs,
  //   which can be referred to in the content expressions for the
  //   schema.
  //
  //   inline:: ?bool
  //   Should be set to true for inline nodes. (Implied for text nodes.)
  //
  //   atom:: ?bool
  //   Can be set to true to indicate that, though this isn't a [leaf
  //   node](#model.NodeType.isLeaf), it doesn't have directly editable
  //   content and should be treated as a single unit in the view.
  //
  //   attrs:: ?Object<AttributeSpec>
  //   The attributes that nodes of this type get.
  //
  //   selectable:: ?bool
  //   Controls whether nodes of this type can be selected as a [node
  //   selection](#state.NodeSelection). Defaults to true for non-text
  //   nodes.
  //
  //   draggable:: ?bool
  //   Determines whether nodes of this type can be dragged without
  //   being selected. Defaults to false.
  //
  //   code:: ?bool
  //   Can be used to indicate that this node contains code, which
  //   causes some commands to behave differently.
  //
  //   defining:: ?bool
  //   Determines whether this node is considered an important parent
  //   node during replace operations (such as paste). Non-defining (the
  //   default) nodes get dropped when their entire content is replaced,
  //   whereas defining nodes persist and wrap the inserted content.
  //   Likewise, in _inserted_ content the defining parents of the
  //   content are preserved when possible. Typically,
  //   non-default-paragraph textblock types, and possibly list items,
  //   are marked as defining.
  //
  //   isolating:: ?bool
  //   When enabled (default is false), the sides of nodes of this type
  //   count as boundaries that regular editing operations, like
  //   backspacing or lifting, won't cross. An example of a node that
  //   should probably have this enabled is a table cell.
  //
  //   toDOM:: ?(node: Node) → DOMOutputSpec
  //   Defines the default way a node of this type should be serialized
  //   to DOM/HTML (as used by
  //   [`DOMSerializer.fromSchema`](#model.DOMSerializer^fromSchema)).
  //   Should return a DOM node or an [array
  //   structure](#model.DOMOutputSpec) that describes one, with an
  //   optional number zero (“hole”) in it to indicate where the node's
  //   content should be inserted.
  //
  //   For text nodes, the default is to create a text DOM node. Though
  //   it is possible to create a serializer where text is rendered
  //   differently, this is not supported inside the editor, so you
  //   shouldn't override that in your text node spec.
  //
  //   parseDOM:: ?[ParseRule]
  //   Associates DOM parser information with this node, which can be
  //   used by [`DOMParser.fromSchema`](#model.DOMParser^fromSchema) to
  //   automatically derive a parser. The `node` field in the rules is
  //   implied (the name of this node will be filled in automatically).
  //   If you supply your own parser, you do not need to also specify
  //   parsing rules in your schema.
  //
  //   toDebugString:: ?(node: Node) -> string
  //   Defines the default way a node of this type should be serialized
  //   to a string representation for debugging (e.g. in error messages).

  // MarkSpec:: interface
  //
  //   attrs:: ?Object<AttributeSpec>
  //   The attributes that marks of this type get.
  //
  //   inclusive:: ?bool
  //   Whether this mark should be active when the cursor is positioned
  //   at its end (or at its start when that is also the start of the
  //   parent node). Defaults to true.
  //
  //   excludes:: ?string
  //   Determines which other marks this mark can coexist with. Should
  //   be a space-separated strings naming other marks or groups of marks.
  //   When a mark is [added](#model.Mark.addToSet) to a set, all marks
  //   that it excludes are removed in the process. If the set contains
  //   any mark that excludes the new mark but is not, itself, excluded
  //   by the new mark, the mark can not be added an the set. You can
  //   use the value `"_"` to indicate that the mark excludes all
  //   marks in the schema.
  //
  //   Defaults to only being exclusive with marks of the same type. You
  //   can set it to an empty string (or any string not containing the
  //   mark's own name) to allow multiple marks of a given type to
  //   coexist (as long as they have different attributes).
  //
  //   group:: ?string
  //   The group or space-separated groups to which this mark belongs.
  //
  //   spanning:: ?bool
  //   Determines whether marks of this type can span multiple adjacent
  //   nodes when serialized to DOM/HTML. Defaults to true.
  //
  //   toDOM:: ?(mark: Mark, inline: bool) → DOMOutputSpec
  //   Defines the default way marks of this type should be serialized
  //   to DOM/HTML. When the resulting spec contains a hole, that is
  //   where the marked content is placed. Otherwise, it is appended to
  //   the top node.
  //
  //   parseDOM:: ?[ParseRule]
  //   Associates DOM parser information with this mark (see the
  //   corresponding [node spec field](#model.NodeSpec.parseDOM)). The
  //   `mark` field in the rules is implied.

  // AttributeSpec:: interface
  //
  // Used to [define](#model.NodeSpec.attrs) attributes on nodes or
  // marks.
  //
  //   default:: ?any
  //   The default value for this attribute, to use when no explicit
  //   value is provided. Attributes that have no default must be
  //   provided whenever a node or mark of a type that has them is
  //   created.

  // ::- A document schema. Holds [node](#model.NodeType) and [mark
  // type](#model.MarkType) objects for the nodes and marks that may
  // occur in conforming documents, and provides functionality for
  // creating and deserializing such documents.
  var Schema = function Schema(spec) {
    var this$1 = this;

    // :: SchemaSpec
    // The [spec](#model.SchemaSpec) on which the schema is based,
    // with the added guarantee that its `nodes` and `marks`
    // properties are
    // [`OrderedMap`](https://github.com/marijnh/orderedmap) instances
    // (not raw objects).
    this.spec = {};
    for (var prop in spec) { this$1.spec[prop] = spec[prop]; }
    this.spec.nodes = OrderedMap.from(spec.nodes);
    this.spec.marks = OrderedMap.from(spec.marks);

    // :: Object<NodeType>
    // An object mapping the schema's node names to node type objects.
    this.nodes = NodeType.compile(this.spec.nodes, this);

    // :: Object<MarkType>
    // A map from mark names to mark type objects.
    this.marks = MarkType.compile(this.spec.marks, this);

    var contentExprCache = Object.create(null);
    for (var prop$1 in this$1.nodes) {
      if (prop$1 in this$1.marks)
        { throw new RangeError(prop$1 + " can not be both a node and a mark") }
      var type = this$1.nodes[prop$1], contentExpr = type.spec.content || "", markExpr = type.spec.marks;
      type.contentMatch = contentExprCache[contentExpr] ||
        (contentExprCache[contentExpr] = ContentMatch.parse(contentExpr, this$1.nodes));
      type.inlineContent = type.contentMatch.inlineContent;
      type.markSet = markExpr == "_" ? null :
        markExpr ? gatherMarks(this$1, markExpr.split(" ")) :
        markExpr == "" || !type.inlineContent ? [] : null;
    }
    for (var prop$2 in this$1.marks) {
      var type$1 = this$1.marks[prop$2], excl = type$1.spec.excludes;
      type$1.excluded = excl == null ? [type$1] : excl == "" ? [] : gatherMarks(this$1, excl.split(" "));
    }

    this.nodeFromJSON = this.nodeFromJSON.bind(this);
    this.markFromJSON = this.markFromJSON.bind(this);

    // :: NodeType
    // The type of the [default top node](#model.SchemaSpec.topNode)
    // for this schema.
    this.topNodeType = this.nodes[this.spec.topNode || "doc"];

    // :: Object
    // An object for storing whatever values modules may want to
    // compute and cache per schema. (If you want to store something
    // in it, try to use property names unlikely to clash.)
    this.cached = Object.create(null);
    this.cached.wrappings = Object.create(null);
  };

  // :: (union<string, NodeType>, ?Object, ?union<Fragment, Node, [Node]>, ?[Mark]) → Node
  // Create a node in this schema. The `type` may be a string or a
  // `NodeType` instance. Attributes will be extended
  // with defaults, `content` may be a `Fragment`,
  // `null`, a `Node`, or an array of nodes.
  Schema.prototype.node = function node (type, attrs, content, marks) {
    if (typeof type == "string")
      { type = this.nodeType(type); }
    else if (!(type instanceof NodeType))
      { throw new RangeError("Invalid node type: " + type) }
    else if (type.schema != this)
      { throw new RangeError("Node type from different schema used (" + type.name + ")") }

    return type.createChecked(attrs, content, marks)
  };

  // :: (string, ?[Mark]) → Node
  // Create a text node in the schema. Empty text nodes are not
  // allowed.
  Schema.prototype.text = function text (text$1, marks) {
    var type = this.nodes.text;
    return new TextNode(type, type.defaultAttrs, text$1, Mark.setFrom(marks))
  };

  // :: (union<string, MarkType>, ?Object) → Mark
  // Create a mark with the given type and attributes.
  Schema.prototype.mark = function mark (type, attrs) {
    if (typeof type == "string") { type = this.marks[type]; }
    return type.create(attrs)
  };

  // :: (Object) → Node
  // Deserialize a node from its JSON representation. This method is
  // bound.
  Schema.prototype.nodeFromJSON = function nodeFromJSON (json) {
    return Node.fromJSON(this, json)
  };

  // :: (Object) → Mark
  // Deserialize a mark from its JSON representation. This method is
  // bound.
  Schema.prototype.markFromJSON = function markFromJSON (json) {
    return Mark.fromJSON(this, json)
  };

  Schema.prototype.nodeType = function nodeType (name) {
    var found = this.nodes[name];
    if (!found) { throw new RangeError("Unknown node type: " + name) }
    return found
  };

  function gatherMarks(schema, marks) {
    var found = [];
    for (var i = 0; i < marks.length; i++) {
      var name = marks[i], mark = schema.marks[name], ok = mark;
      if (mark) {
        found.push(mark);
      } else {
        for (var prop in schema.marks) {
          var mark$1 = schema.marks[prop];
          if (name == "_" || (mark$1.spec.group && mark$1.spec.group.split(" ").indexOf(name) > -1))
            { found.push(ok = mark$1); }
        }
      }
      if (!ok) { throw new SyntaxError("Unknown mark type: '" + marks[i] + "'") }
    }
    return found
  }

  // ParseOptions:: interface
  // These are the options recognized by the
  // [`parse`](#model.DOMParser.parse) and
  // [`parseSlice`](#model.DOMParser.parseSlice) methods.
  //
  //   preserveWhitespace:: ?union<bool, "full">
  //   By default, whitespace is collapsed as per HTML's rules. Pass
  //   `true` to preserve whitespace, but normalize newlines to
  //   spaces, and `"full"` to preserve whitespace entirely.
  //
  //   findPositions:: ?[{node: dom.Node, offset: number}]
  //   When given, the parser will, beside parsing the content,
  //   record the document positions of the given DOM positions. It
  //   will do so by writing to the objects, adding a `pos` property
  //   that holds the document position. DOM positions that are not
  //   in the parsed content will not be written to.
  //
  //   from:: ?number
  //   The child node index to start parsing from.
  //
  //   to:: ?number
  //   The child node index to stop parsing at.
  //
  //   topNode:: ?Node
  //   By default, the content is parsed into the schema's default
  //   [top node type](#model.Schema.topNodeType). You can pass this
  //   option to use the type and attributes from a different node
  //   as the top container.
  //
  //   topMatch:: ?ContentMatch
  //   Provide the starting content match that content parsed into the
  //   top node is matched against.
  //
  //   context:: ?ResolvedPos
  //   A set of additional nodes to count as
  //   [context](#model.ParseRule.context) when parsing, above the
  //   given [top node](#model.ParseOptions.topNode).

  // ParseRule:: interface
  // A value that describes how to parse a given DOM node or inline
  // style as a ProseMirror node or mark.
  //
  //   tag:: ?string
  //   A CSS selector describing the kind of DOM elements to match. A
  //   single rule should have _either_ a `tag` or a `style` property.
  //
  //   namespace:: ?string
  //   The namespace to match. This should be used with `tag`.
  //   Nodes are only matched when the namespace matches or this property
  //   is null.
  //
  //   style:: ?string
  //   A CSS property name to match. When given, this rule matches
  //   inline styles that list that property. May also have the form
  //   `"property=value"`, in which case the rule only matches if the
  //   propery's value exactly matches the given value. (For more
  //   complicated filters, use [`getAttrs`](#model.ParseRule.getAttrs)
  //   and return undefined to indicate that the match failed.)
  //
  //   priority:: ?number
  //   Can be used to change the order in which the parse rules in a
  //   schema are tried. Those with higher priority come first. Rules
  //   without a priority are counted as having priority 50. This
  //   property is only meaningful in a schema—when directly
  //   constructing a parser, the order of the rule array is used.
  //
  //   context:: ?string
  //   When given, restricts this rule to only match when the current
  //   context—the parent nodes into which the content is being
  //   parsed—matches this expression. Should contain one or more node
  //   names or node group names followed by single or double slashes.
  //   For example `"paragraph/"` means the rule only matches when the
  //   parent node is a paragraph, `"blockquote/paragraph/"` restricts
  //   it to be in a paragraph that is inside a blockquote, and
  //   `"section//"` matches any position inside a section—a double
  //   slash matches any sequence of ancestor nodes. To allow multiple
  //   different contexts, they can be separated by a pipe (`|`)
  //   character, as in `"blockquote/|list_item/"`.
  //
  //   node:: ?string
  //   The name of the node type to create when this rule matches. Only
  //   valid for rules with a `tag` property, not for style rules. Each
  //   rule should have one of a `node`, `mark`, or `ignore` property
  //   (except when it appears in a [node](#model.NodeSpec.parseDOM) or
  //   [mark spec](#model.MarkSpec.parseDOM), in which case the `node`
  //   or `mark` property will be derived from its position).
  //
  //   mark:: ?string
  //   The name of the mark type to wrap the matched content in.
  //
  //   ignore:: ?bool
  //   When true, ignore content that matches this rule.
  //
  //   skip:: ?bool
  //   When true, ignore the node that matches this rule, but do parse
  //   its content.
  //
  //   attrs:: ?Object
  //   Attributes for the node or mark created by this rule. When
  //   `getAttrs` is provided, it takes precedence.
  //
  //   getAttrs:: ?(union<dom.Node, string>) → ?union<Object, false>
  //   A function used to compute the attributes for the node or mark
  //   created by this rule. Can also be used to describe further
  //   conditions the DOM element or style must match. When it returns
  //   `false`, the rule won't match. When it returns null or undefined,
  //   that is interpreted as an empty/default set of attributes.
  //
  //   Called with a DOM Element for `tag` rules, and with a string (the
  //   style's value) for `style` rules.
  //
  //   contentElement:: ?union<string, (dom.Node) → dom.Node>
  //   For `tag` rules that produce non-leaf nodes or marks, by default
  //   the content of the DOM element is parsed as content of the mark
  //   or node. If the child nodes are in a descendent node, this may be
  //   a CSS selector string that the parser must use to find the actual
  //   content element, or a function that returns the actual content
  //   element to the parser.
  //
  //   getContent:: ?(dom.Node, schema: Schema) → Fragment
  //   Can be used to override the content of a matched node. When
  //   present, instead of parsing the node's child nodes, the result of
  //   this function is used.
  //
  //   preserveWhitespace:: ?union<bool, "full">
  //   Controls whether whitespace should be preserved when parsing the
  //   content inside the matched element. `false` means whitespace may
  //   be collapsed, `true` means that whitespace should be preserved
  //   but newlines normalized to spaces, and `"full"` means that
  //   newlines should also be preserved.

  // ::- A DOM parser represents a strategy for parsing DOM content into
  // a ProseMirror document conforming to a given schema. Its behavior
  // is defined by an array of [rules](#model.ParseRule).
  var DOMParser = function DOMParser(schema, rules) {
    var this$1 = this;

    // :: Schema
    // The schema into which the parser parses.
    this.schema = schema;
    // :: [ParseRule]
    // The set of [parse rules](#model.ParseRule) that the parser
    // uses, in order of precedence.
    this.rules = rules;
    this.tags = [];
    this.styles = [];

    rules.forEach(function (rule) {
      if (rule.tag) { this$1.tags.push(rule); }
      else if (rule.style) { this$1.styles.push(rule); }
    });
  };

  // :: (dom.Node, ?ParseOptions) → Node
  // Parse a document from the content of a DOM node.
  DOMParser.prototype.parse = function parse (dom, options) {
      if ( options === void 0 ) options = {};

    var context = new ParseContext(this, options, false);
    context.addAll(dom, null, options.from, options.to);
    return context.finish()
  };

  // :: (dom.Node, ?ParseOptions) → Slice
  // Parses the content of the given DOM node, like
  // [`parse`](#model.DOMParser.parse), and takes the same set of
  // options. But unlike that method, which produces a whole node,
  // this one returns a slice that is open at the sides, meaning that
  // the schema constraints aren't applied to the start of nodes to
  // the left of the input and the end of nodes at the end.
  DOMParser.prototype.parseSlice = function parseSlice (dom, options) {
      if ( options === void 0 ) options = {};

    var context = new ParseContext(this, options, true);
    context.addAll(dom, null, options.from, options.to);
    return Slice.maxOpen(context.finish())
  };

  DOMParser.prototype.matchTag = function matchTag (dom, context) {
      var this$1 = this;

    for (var i = 0; i < this.tags.length; i++) {
      var rule = this$1.tags[i];
      if (matches(dom, rule.tag) &&
          (rule.namespace === undefined || dom.namespaceURI == rule.namespace) &&
          (!rule.context || context.matchesContext(rule.context))) {
        if (rule.getAttrs) {
          var result = rule.getAttrs(dom);
          if (result === false) { continue }
          rule.attrs = result;
        }
        return rule
      }
    }
  };

  DOMParser.prototype.matchStyle = function matchStyle (prop, value, context) {
      var this$1 = this;

    for (var i = 0; i < this.styles.length; i++) {
      var rule = this$1.styles[i];
      if (rule.style.indexOf(prop) != 0 ||
          rule.context && !context.matchesContext(rule.context) ||
          // Test that the style string either precisely matches the prop,
          // or has an '=' sign after the prop, followed by the given
          // value.
          rule.style.length > prop.length &&
          (rule.style.charCodeAt(prop.length) != 61 || rule.style.slice(prop.length + 1) != value))
        { continue }
      if (rule.getAttrs) {
        var result = rule.getAttrs(value);
        if (result === false) { continue }
        rule.attrs = result;
      }
      return rule
    }
  };

  // : (Schema) → [ParseRule]
  DOMParser.schemaRules = function schemaRules (schema) {
    var result = [];
    function insert(rule) {
      var priority = rule.priority == null ? 50 : rule.priority, i = 0;
      for (; i < result.length; i++) {
        var next = result[i], nextPriority = next.priority == null ? 50 : next.priority;
        if (nextPriority < priority) { break }
      }
      result.splice(i, 0, rule);
    }

    var loop = function ( name ) {
      var rules = schema.marks[name].spec.parseDOM;
      if (rules) { rules.forEach(function (rule) {
        insert(rule = copy(rule));
        rule.mark = name;
      }); }
    };

      for (var name in schema.marks) loop( name );
    var loop$1 = function ( name ) {
      var rules$1 = schema.nodes[name$1].spec.parseDOM;
      if (rules$1) { rules$1.forEach(function (rule) {
        insert(rule = copy(rule));
        rule.node = name$1;
      }); }
    };

      for (var name$1 in schema.nodes) loop$1();
    return result
  };

  // :: (Schema) → DOMParser
  // Construct a DOM parser using the parsing rules listed in a
  // schema's [node specs](#model.NodeSpec.parseDOM), reordered by
  // [priority](#model.ParseRule.priority).
  DOMParser.fromSchema = function fromSchema (schema) {
    return schema.cached.domParser ||
      (schema.cached.domParser = new DOMParser(schema, DOMParser.schemaRules(schema)))
  };

  // : Object<bool> The block-level tags in HTML5
  var blockTags = {
    address: true, article: true, aside: true, blockquote: true, canvas: true,
    dd: true, div: true, dl: true, fieldset: true, figcaption: true, figure: true,
    footer: true, form: true, h1: true, h2: true, h3: true, h4: true, h5: true,
    h6: true, header: true, hgroup: true, hr: true, li: true, noscript: true, ol: true,
    output: true, p: true, pre: true, section: true, table: true, tfoot: true, ul: true
  };

  // : Object<bool> The tags that we normally ignore.
  var ignoreTags = {
    head: true, noscript: true, object: true, script: true, style: true, title: true
  };

  // : Object<bool> List tags.
  var listTags = {ol: true, ul: true};

  // Using a bitfield for node context options
  var OPT_PRESERVE_WS = 1;
  var OPT_PRESERVE_WS_FULL = 2;
  var OPT_OPEN_LEFT = 4;

  function wsOptionsFor(preserveWhitespace) {
    return (preserveWhitespace ? OPT_PRESERVE_WS : 0) | (preserveWhitespace === "full" ? OPT_PRESERVE_WS_FULL : 0)
  }

  var NodeContext = function NodeContext(type, attrs, marks, solid, match, options) {
    this.type = type;
    this.attrs = attrs;
    this.solid = solid;
    this.match = match || (options & OPT_OPEN_LEFT ? null : type.contentMatch);
    this.options = options;
    this.content = [];
    this.marks = marks;
    this.activeMarks = Mark.none;
  };

  NodeContext.prototype.findWrapping = function findWrapping (node) {
    if (!this.match) {
      if (!this.type) { return [] }
      var fill = this.type.contentMatch.fillBefore(Fragment.from(node));
      if (fill) {
        this.match = this.type.contentMatch.matchFragment(fill);
      } else {
        var start = this.type.contentMatch, wrap;
        if (wrap = start.findWrapping(node.type)) {
          this.match = start;
          return wrap
        } else {
          return null
        }
      }
    }
    return this.match.findWrapping(node.type)
  };

  NodeContext.prototype.finish = function finish (openEnd) {
    if (!(this.options & OPT_PRESERVE_WS)) { // Strip trailing whitespace
      var last = this.content[this.content.length - 1], m;
      if (last && last.isText && (m = /\s+$/.exec(last.text))) {
        if (last.text.length == m[0].length) { this.content.pop(); }
        else { this.content[this.content.length - 1] = last.withText(last.text.slice(0, last.text.length - m[0].length)); }
      }
    }
    var content = Fragment.from(this.content);
    if (!openEnd && this.match)
      { content = content.append(this.match.fillBefore(Fragment.empty, true)); }
    return this.type ? this.type.create(this.attrs, content, this.marks) : content
  };

  var ParseContext = function ParseContext(parser, options, open) {
    // : DOMParser The parser we are using.
    this.parser = parser;
    // : Object The options passed to this parse.
    this.options = options;
    this.isOpen = open;
    this.pendingMarks = [];
    var topNode = options.topNode, topContext;
    var topOptions = wsOptionsFor(options.preserveWhitespace) | (open ? OPT_OPEN_LEFT : 0);
    if (topNode)
      { topContext = new NodeContext(topNode.type, topNode.attrs, Mark.none, true,
                                   options.topMatch || topNode.type.contentMatch, topOptions); }
    else if (open)
      { topContext = new NodeContext(null, null, Mark.none, true, null, topOptions); }
    else
      { topContext = new NodeContext(parser.schema.topNodeType, null, Mark.none, true, null, topOptions); }
    this.nodes = [topContext];
    // : [Mark] The current set of marks
    this.open = 0;
    this.find = options.findPositions;
    this.needsBlock = false;
  };

  var prototypeAccessors$6 = { top: {},currentPos: {} };

  prototypeAccessors$6.top.get = function () {
    return this.nodes[this.open]
  };

  // : (dom.Node)
  // Add a DOM node to the content. Text is inserted as text node,
  // otherwise, the node is passed to `addElement` or, if it has a
  // `style` attribute, `addElementWithStyles`.
  ParseContext.prototype.addDOM = function addDOM (dom) {
      var this$1 = this;

    if (dom.nodeType == 3) {
      this.addTextNode(dom);
    } else if (dom.nodeType == 1) {
      var style = dom.getAttribute("style");
      var marks = style ? this.readStyles(parseStyles(style)) : null;
      if (marks != null) { for (var i = 0; i < marks.length; i++) { this$1.addPendingMark(marks[i]); } }
      this.addElement(dom);
      if (marks != null) { for (var i$1 = 0; i$1 < marks.length; i$1++) { this$1.removePendingMark(marks[i$1]); } }
    }
  };

  ParseContext.prototype.addTextNode = function addTextNode (dom) {
    var value = dom.nodeValue;
    var top = this.top;
    if ((top.type ? top.type.inlineContent : top.content.length && top.content[0].isInline) || /\S/.test(value)) {
      if (!(top.options & OPT_PRESERVE_WS)) {
        value = value.replace(/\s+/g, " ");
        // If this starts with whitespace, and there is no node before it, or
        // a hard break, or a text node that ends with whitespace, strip the
        // leading space.
        if (/^\s/.test(value) && this.open == this.nodes.length - 1) {
          var nodeBefore = top.content[top.content.length - 1];
          var domNodeBefore = dom.previousSibling;
          if (!nodeBefore ||
              (domNodeBefore && domNodeBefore.nodeName == 'BR') ||
              (nodeBefore.isText && /\s$/.test(nodeBefore.text)))
            { value = value.slice(1); }
        }
      } else if (!(top.options & OPT_PRESERVE_WS_FULL)) {
        value = value.replace(/\r?\n|\r/g, " ");
      }
      if (value) { this.insertNode(this.parser.schema.text(value)); }
      this.findInText(dom);
    } else {
      this.findInside(dom);
    }
  };

  // : (dom.Element)
  // Try to find a handler for the given tag and use that to parse. If
  // none is found, the element's content nodes are added directly.
  ParseContext.prototype.addElement = function addElement (dom) {
    var name = dom.nodeName.toLowerCase();
    if (listTags.hasOwnProperty(name)) { normalizeList(dom); }
    var rule = (this.options.ruleFromNode && this.options.ruleFromNode(dom)) || this.parser.matchTag(dom, this);
    if (rule ? rule.ignore : ignoreTags.hasOwnProperty(name)) {
      this.findInside(dom);
    } else if (!rule || rule.skip) {
      if (rule && rule.skip.nodeType) { dom = rule.skip; }
      var sync, top = this.top, oldNeedsBlock = this.needsBlock;
      if (blockTags.hasOwnProperty(name)) {
        sync = true;
        if (!top.type) { this.needsBlock = true; }
      }
      this.addAll(dom);
      if (sync) { this.sync(top); }
      this.needsBlock = oldNeedsBlock;
    } else {
      this.addElementByRule(dom, rule);
    }
  };

  // Run any style parser associated with the node's styles. Either
  // return an array of marks, or null to indicate some of the styles
  // had a rule with `ignore` set.
  ParseContext.prototype.readStyles = function readStyles (styles) {
      var this$1 = this;

    var marks = Mark.none;
    for (var i = 0; i < styles.length; i += 2) {
      var rule = this$1.parser.matchStyle(styles[i], styles[i + 1], this$1);
      if (!rule) { continue }
      if (rule.ignore) { return null }
      marks = this$1.parser.schema.marks[rule.mark].create(rule.attrs).addToSet(marks);
    }
    return marks
  };

  // : (dom.Element, ParseRule) → bool
  // Look up a handler for the given node. If none are found, return
  // false. Otherwise, apply it, use its return value to drive the way
  // the node's content is wrapped, and return true.
  ParseContext.prototype.addElementByRule = function addElementByRule (dom, rule) {
      var this$1 = this;

    var sync, nodeType, markType, mark;
    if (rule.node) {
      nodeType = this.parser.schema.nodes[rule.node];
      if (nodeType.isLeaf) { this.insertNode(nodeType.create(rule.attrs)); }
      else { sync = this.enter(nodeType, rule.attrs, rule.preserveWhitespace); }
    } else {
      markType = this.parser.schema.marks[rule.mark];
      mark = markType.create(rule.attrs);
      this.addPendingMark(mark);
    }
    var startIn = this.top;

    if (nodeType && nodeType.isLeaf) {
      this.findInside(dom);
    } else if (rule.getContent) {
      this.findInside(dom);
      rule.getContent(dom, this.parser.schema).forEach(function (node) { return this$1.insertNode(node); });
    } else {
      var contentDOM = rule.contentElement;
      if (typeof contentDOM == "string") { contentDOM = dom.querySelector(contentDOM); }
      else if (typeof contentDOM == "function") { contentDOM = contentDOM(dom); }
      if (!contentDOM) { contentDOM = dom; }
      this.findAround(dom, contentDOM, true);
      this.addAll(contentDOM, sync);
    }
    if (sync) { this.sync(startIn); this.open--; }
    if (mark) { this.removePendingMark(mark); }
    return true
  };

  // : (dom.Node, ?NodeBuilder, ?number, ?number)
  // Add all child nodes between `startIndex` and `endIndex` (or the
  // whole node, if not given). If `sync` is passed, use it to
  // synchronize after every block element.
  ParseContext.prototype.addAll = function addAll (parent, sync, startIndex, endIndex) {
      var this$1 = this;

    var index = startIndex || 0;
    for (var dom = startIndex ? parent.childNodes[startIndex] : parent.firstChild,
             end = endIndex == null ? null : parent.childNodes[endIndex];
         dom != end; dom = dom.nextSibling, ++index) {
      this$1.findAtPoint(parent, index);
      this$1.addDOM(dom);
      if (sync && blockTags.hasOwnProperty(dom.nodeName.toLowerCase()))
        { this$1.sync(sync); }
    }
    this.findAtPoint(parent, index);
  };

  // Try to find a way to fit the given node type into the current
  // context. May add intermediate wrappers and/or leave non-solid
  // nodes that we're in.
  ParseContext.prototype.findPlace = function findPlace (node) {
      var this$1 = this;

    var route, sync;
    for (var depth = this.open; depth >= 0; depth--) {
      var cx = this$1.nodes[depth];
      var found = cx.findWrapping(node);
      if (found && (!route || route.length > found.length)) {
        route = found;
        sync = cx;
        if (!found.length) { break }
      }
      if (cx.solid) { break }
    }
    if (!route) { return false }
    this.sync(sync);
    for (var i = 0; i < route.length; i++)
      { this$1.enterInner(route[i], null, false); }
    return true
  };

  // : (Node) → ?Node
  // Try to insert the given node, adjusting the context when needed.
  ParseContext.prototype.insertNode = function insertNode (node) {
    if (node.isInline && this.needsBlock && !this.top.type) {
      var block = this.textblockFromContext();
      if (block) { this.enterInner(block); }
    }
    if (this.findPlace(node)) {
      this.closeExtra();
      var top = this.top;
      this.applyPendingMarks(top);
      if (top.match) { top.match = top.match.matchType(node.type); }
      var marks = top.activeMarks;
      for (var i = 0; i < node.marks.length; i++)
        { if (!top.type || top.type.allowsMarkType(node.marks[i].type))
          { marks = node.marks[i].addToSet(marks); } }
      top.content.push(node.mark(marks));
    }
  };

  ParseContext.prototype.applyPendingMarks = function applyPendingMarks (top) {
      var this$1 = this;

    for (var i = 0; i < this.pendingMarks.length; i++) {
      var mark = this$1.pendingMarks[i];
      if ((!top.type || top.type.allowsMarkType(mark.type)) && !mark.isInSet(top.activeMarks)) {
        top.activeMarks = mark.addToSet(top.activeMarks);
        this$1.pendingMarks.splice(i--, 1);
      }
    }
  };

  // : (NodeType, ?Object) → bool
  // Try to start a node of the given type, adjusting the context when
  // necessary.
  ParseContext.prototype.enter = function enter (type, attrs, preserveWS) {
    var ok = this.findPlace(type.create(attrs));
    if (ok) {
      this.applyPendingMarks(this.top);
      this.enterInner(type, attrs, true, preserveWS);
    }
    return ok
  };

  // Open a node of the given type
  ParseContext.prototype.enterInner = function enterInner (type, attrs, solid, preserveWS) {
    this.closeExtra();
    var top = this.top;
    top.match = top.match && top.match.matchType(type, attrs);
    var options = preserveWS == null ? top.options & ~OPT_OPEN_LEFT : wsOptionsFor(preserveWS);
    if ((top.options & OPT_OPEN_LEFT) && top.content.length == 0) { options |= OPT_OPEN_LEFT; }
    this.nodes.push(new NodeContext(type, attrs, top.activeMarks, solid, null, options));
    this.open++;
  };

  // Make sure all nodes above this.open are finished and added to
  // their parents
  ParseContext.prototype.closeExtra = function closeExtra (openEnd) {
      var this$1 = this;

    var i = this.nodes.length - 1;
    if (i > this.open) {
      for (; i > this.open; i--) { this$1.nodes[i - 1].content.push(this$1.nodes[i].finish(openEnd)); }
      this.nodes.length = this.open + 1;
    }
  };

  ParseContext.prototype.finish = function finish () {
    this.open = 0;
    this.closeExtra(this.isOpen);
    return this.nodes[0].finish(this.isOpen || this.options.topOpen)
  };

  ParseContext.prototype.sync = function sync (to) {
      var this$1 = this;

    for (var i = this.open; i >= 0; i--) { if (this$1.nodes[i] == to) {
      this$1.open = i;
      return
    } }
  };

  ParseContext.prototype.addPendingMark = function addPendingMark (mark) {
    this.pendingMarks.push(mark);
  };

  ParseContext.prototype.removePendingMark = function removePendingMark (mark) {
    var found = this.pendingMarks.lastIndexOf(mark);
    if (found > -1) {
      this.pendingMarks.splice(found, 1);
    } else {
      var top = this.top;
      top.activeMarks = mark.removeFromSet(top.activeMarks);
    }
  };

  prototypeAccessors$6.currentPos.get = function () {
      var this$1 = this;

    this.closeExtra();
    var pos = 0;
    for (var i = this.open; i >= 0; i--) {
      var content = this$1.nodes[i].content;
      for (var j = content.length - 1; j >= 0; j--)
        { pos += content[j].nodeSize; }
      if (i) { pos++; }
    }
    return pos
  };

  ParseContext.prototype.findAtPoint = function findAtPoint (parent, offset) {
      var this$1 = this;

    if (this.find) { for (var i = 0; i < this.find.length; i++) {
      if (this$1.find[i].node == parent && this$1.find[i].offset == offset)
        { this$1.find[i].pos = this$1.currentPos; }
    } }
  };

  ParseContext.prototype.findInside = function findInside (parent) {
      var this$1 = this;

    if (this.find) { for (var i = 0; i < this.find.length; i++) {
      if (this$1.find[i].pos == null && parent.nodeType == 1 && parent.contains(this$1.find[i].node))
        { this$1.find[i].pos = this$1.currentPos; }
    } }
  };

  ParseContext.prototype.findAround = function findAround (parent, content, before) {
      var this$1 = this;

    if (parent != content && this.find) { for (var i = 0; i < this.find.length; i++) {
      if (this$1.find[i].pos == null && parent.nodeType == 1 && parent.contains(this$1.find[i].node)) {
        var pos = content.compareDocumentPosition(this$1.find[i].node);
        if (pos & (before ? 2 : 4))
          { this$1.find[i].pos = this$1.currentPos; }
      }
    } }
  };

  ParseContext.prototype.findInText = function findInText (textNode) {
      var this$1 = this;

    if (this.find) { for (var i = 0; i < this.find.length; i++) {
      if (this$1.find[i].node == textNode)
        { this$1.find[i].pos = this$1.currentPos - (textNode.nodeValue.length - this$1.find[i].offset); }
    } }
  };

  // : (string) → bool
  // Determines whether the given [context
  // string](#ParseRule.context) matches this context.
  ParseContext.prototype.matchesContext = function matchesContext (context) {
      var this$1 = this;

    if (context.indexOf("|") > -1)
      { return context.split(/\s*\|\s*/).some(this.matchesContext, this) }

    var parts = context.split("/");
    var option = this.options.context;
    var useRoot = !this.isOpen && (!option || option.parent.type == this.nodes[0].type);
    var minDepth = -(option ? option.depth + 1 : 0) + (useRoot ? 0 : 1);
    var match = function (i, depth) {
      for (; i >= 0; i--) {
        var part = parts[i];
        if (part == "") {
          if (i == parts.length - 1 || i == 0) { continue }
          for (; depth >= minDepth; depth--)
            { if (match(i - 1, depth)) { return true } }
          return false
        } else {
          var next = depth > 0 || (depth == 0 && useRoot) ? this$1.nodes[depth].type
              : option && depth >= minDepth ? option.node(depth - minDepth).type
              : null;
          if (!next || (next.name != part && next.groups.indexOf(part) == -1))
            { return false }
          depth--;
        }
      }
      return true
    };
    return match(parts.length - 1, this.open)
  };

  ParseContext.prototype.textblockFromContext = function textblockFromContext () {
      var this$1 = this;

    var $context = this.options.context;
    if ($context) { for (var d = $context.depth; d >= 0; d--) {
      var deflt = $context.node(d).contentMatchAt($context.indexAfter(d)).defaultType;
      if (deflt && deflt.isTextblock && deflt.defaultAttrs) { return deflt }
    } }
    for (var name in this$1.parser.schema.nodes) {
      var type = this$1.parser.schema.nodes[name];
      if (type.isTextblock && type.defaultAttrs) { return type }
    }
  };

  Object.defineProperties( ParseContext.prototype, prototypeAccessors$6 );

  // Kludge to work around directly nested list nodes produced by some
  // tools and allowed by browsers to mean that the nested list is
  // actually part of the list item above it.
  function normalizeList(dom) {
    for (var child = dom.firstChild, prevItem = null; child; child = child.nextSibling) {
      var name = child.nodeType == 1 ? child.nodeName.toLowerCase() : null;
      if (name && listTags.hasOwnProperty(name) && prevItem) {
        prevItem.appendChild(child);
        child = prevItem;
      } else if (name == "li") {
        prevItem = child;
      } else if (name) {
        prevItem = null;
      }
    }
  }

  // Apply a CSS selector.
  function matches(dom, selector) {
    return (dom.matches || dom.msMatchesSelector || dom.webkitMatchesSelector || dom.mozMatchesSelector).call(dom, selector)
  }

  // : (string) → [string]
  // Tokenize a style attribute into property/value pairs.
  function parseStyles(style) {
    var re = /\s*([\w-]+)\s*:\s*([^;]+)/g, m, result = [];
    while (m = re.exec(style)) { result.push(m[1], m[2].trim()); }
    return result
  }

  function copy(obj) {
    var copy = {};
    for (var prop in obj) { copy[prop] = obj[prop]; }
    return copy
  }

  // DOMOutputSpec:: interface
  // A description of a DOM structure. Can be either a string, which is
  // interpreted as a text node, a DOM node, which is interpreted as
  // itself, or an array.
  //
  // An array describes a DOM element. The first value in the array
  // should be a string—the name of the DOM element. If the second
  // element is plain object, it is interpreted as a set of attributes
  // for the element. Any elements after that (including the 2nd if it's
  // not an attribute object) are interpreted as children of the DOM
  // elements, and must either be valid `DOMOutputSpec` values, or the
  // number zero.
  //
  // The number zero (pronounced “hole”) is used to indicate the place
  // where a node's child nodes should be inserted. It it occurs in an
  // output spec, it should be the only child element in its parent
  // node.

  // ::- A DOM serializer knows how to convert ProseMirror nodes and
  // marks of various types to DOM nodes.
  var DOMSerializer = function DOMSerializer(nodes, marks) {
    // :: Object<(node: Node) → DOMOutputSpec>
    // The node serialization functions.
    this.nodes = nodes || {};
    // :: Object<?(mark: Mark, inline: bool) → DOMOutputSpec>
    // The mark serialization functions.
    this.marks = marks || {};
  };

  // :: (Fragment, ?Object) → dom.DocumentFragment
  // Serialize the content of this fragment to a DOM fragment. When
  // not in the browser, the `document` option, containing a DOM
  // document, should be passed so that the serializer can create
  // nodes.
  DOMSerializer.prototype.serializeFragment = function serializeFragment (fragment, options, target) {
      var this$1 = this;
      if ( options === void 0 ) options = {};

    if (!target) { target = doc(options).createDocumentFragment(); }

    var top = target, active = null;
    fragment.forEach(function (node) {
      if (active || node.marks.length) {
        if (!active) { active = []; }
        var keep = 0, rendered = 0;
        while (keep < active.length && rendered < node.marks.length) {
          var next = node.marks[rendered];
          if (!this$1.marks[next.type.name]) { rendered++; continue }
          if (!next.eq(active[keep]) || next.type.spec.spanning === false) { break }
          keep += 2; rendered++;
        }
        while (keep < active.length) {
          top = active.pop();
          active.pop();
        }
        while (rendered < node.marks.length) {
          var add = node.marks[rendered++];
          var markDOM = this$1.serializeMark(add, node.isInline, options);
          if (markDOM) {
            active.push(add, top);
            top.appendChild(markDOM.dom);
            top = markDOM.contentDOM || markDOM.dom;
          }
        }
      }
      top.appendChild(this$1.serializeNode(node, options));
    });

    return target
  };

  // :: (Node, ?Object) → dom.Node
  // Serialize this node to a DOM node. This can be useful when you
  // need to serialize a part of a document, as opposed to the whole
  // document. To serialize a whole document, use
  // [`serializeFragment`](#model.DOMSerializer.serializeFragment) on
  // its [content](#model.Node.content).
  DOMSerializer.prototype.serializeNode = function serializeNode (node, options) {
      if ( options === void 0 ) options = {};

    var ref =
        DOMSerializer.renderSpec(doc(options), this.nodes[node.type.name](node));
      var dom = ref.dom;
      var contentDOM = ref.contentDOM;
    if (contentDOM) {
      if (node.isLeaf)
        { throw new RangeError("Content hole not allowed in a leaf node spec") }
      if (options.onContent)
        { options.onContent(node, contentDOM, options); }
      else
        { this.serializeFragment(node.content, options, contentDOM); }
    }
    return dom
  };

  DOMSerializer.prototype.serializeNodeAndMarks = function serializeNodeAndMarks (node, options) {
      var this$1 = this;
      if ( options === void 0 ) options = {};

    var dom = this.serializeNode(node, options);
    for (var i = node.marks.length - 1; i >= 0; i--) {
      var wrap = this$1.serializeMark(node.marks[i], node.isInline, options);
      if (wrap) {
        (wrap.contentDOM || wrap.dom).appendChild(dom);
        dom = wrap.dom;
      }
    }
    return dom
  };

  DOMSerializer.prototype.serializeMark = function serializeMark (mark, inline, options) {
      if ( options === void 0 ) options = {};

    var toDOM = this.marks[mark.type.name];
    return toDOM && DOMSerializer.renderSpec(doc(options), toDOM(mark, inline))
  };

  // :: (dom.Document, DOMOutputSpec) → {dom: dom.Node, contentDOM: ?dom.Node}
  // Render an [output spec](#model.DOMOutputSpec) to a DOM node. If
  // the spec has a hole (zero) in it, `contentDOM` will point at the
  // node with the hole.
  DOMSerializer.renderSpec = function renderSpec (doc, structure) {
    if (typeof structure == "string")
      { return {dom: doc.createTextNode(structure)} }
    if (structure.nodeType != null)
      { return {dom: structure} }
    var dom = doc.createElement(structure[0]), contentDOM = null;
    var attrs = structure[1], start = 1;
    if (attrs && typeof attrs == "object" && attrs.nodeType == null && !Array.isArray(attrs)) {
      start = 2;
      for (var name in attrs) {
        if (attrs[name] != null) { dom.setAttribute(name, attrs[name]); }
      }
    }
    for (var i = start; i < structure.length; i++) {
      var child = structure[i];
      if (child === 0) {
        if (i < structure.length - 1 || i > start)
          { throw new RangeError("Content hole must be the only child of its parent node") }
        return {dom: dom, contentDOM: dom}
      } else {
        var ref = DOMSerializer.renderSpec(doc, child);
          var inner = ref.dom;
          var innerContent = ref.contentDOM;
        dom.appendChild(inner);
        if (innerContent) {
          if (contentDOM) { throw new RangeError("Multiple content holes") }
          contentDOM = innerContent;
        }
      }
    }
    return {dom: dom, contentDOM: contentDOM}
  };

  // :: (Schema) → DOMSerializer
  // Build a serializer using the [`toDOM`](#model.NodeSpec.toDOM)
  // properties in a schema's node and mark specs.
  DOMSerializer.fromSchema = function fromSchema (schema) {
    return schema.cached.domSerializer ||
      (schema.cached.domSerializer = new DOMSerializer(this.nodesFromSchema(schema), this.marksFromSchema(schema)))
  };

  // : (Schema) → Object<(node: Node) → DOMOutputSpec>
  // Gather the serializers in a schema's node specs into an object.
  // This can be useful as a base to build a custom serializer from.
  DOMSerializer.nodesFromSchema = function nodesFromSchema (schema) {
    var result = gatherToDOM(schema.nodes);
    if (!result.text) { result.text = function (node) { return node.text; }; }
    return result
  };

  // : (Schema) → Object<(mark: Mark) → DOMOutputSpec>
  // Gather the serializers in a schema's mark specs into an object.
  DOMSerializer.marksFromSchema = function marksFromSchema (schema) {
    return gatherToDOM(schema.marks)
  };

  function gatherToDOM(obj) {
    var result = {};
    for (var name in obj) {
      var toDOM = obj[name].spec.toDOM;
      if (toDOM) { result[name] = toDOM; }
    }
    return result
  }

  function doc(options) {
    // declare global: window
    return options.document || window.document
  }

  exports.Node = Node;
  exports.ResolvedPos = ResolvedPos;
  exports.NodeRange = NodeRange;
  exports.Fragment = Fragment;
  exports.Slice = Slice;
  exports.ReplaceError = ReplaceError;
  exports.Mark = Mark;
  exports.Schema = Schema;
  exports.NodeType = NodeType;
  exports.MarkType = MarkType;
  exports.ContentMatch = ContentMatch;
  exports.DOMParser = DOMParser;
  exports.DOMSerializer = DOMSerializer;

  });

  unwrapExports(dist);
  var dist_1 = dist.Node;
  var dist_2 = dist.ResolvedPos;
  var dist_3 = dist.NodeRange;
  var dist_4 = dist.Fragment;
  var dist_5 = dist.Slice;
  var dist_6 = dist.ReplaceError;
  var dist_7 = dist.Mark;
  var dist_8 = dist.Schema;
  var dist_9 = dist.NodeType;
  var dist_10 = dist.MarkType;
  var dist_11 = dist.ContentMatch;
  var dist_12 = dist.DOMParser;
  var dist_13 = dist.DOMSerializer;

  var dist$1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, '__esModule', { value: true });



  // Mappable:: interface
  // There are several things that positions can be mapped through.
  // Such objects conform to this interface.
  //
  //   map:: (pos: number, assoc: ?number) → number
  //   Map a position through this object. When given, `assoc` (should
  //   be -1 or 1, defaults to 1) determines with which side the
  //   position is associated, which determines in which direction to
  //   move when a chunk of content is inserted at the mapped position.
  //
  //   mapResult:: (pos: number, assoc: ?number) → MapResult
  //   Map a position, and return an object containing additional
  //   information about the mapping. The result's `deleted` field tells
  //   you whether the position was deleted (completely enclosed in a
  //   replaced range) during the mapping. When content on only one side
  //   is deleted, the position itself is only considered deleted when
  //   `assoc` points in the direction of the deleted content.

  // Recovery values encode a range index and an offset. They are
  // represented as numbers, because tons of them will be created when
  // mapping, for example, a large number of decorations. The number's
  // lower 16 bits provide the index, the remaining bits the offset.
  //
  // Note: We intentionally don't use bit shift operators to en- and
  // decode these, since those clip to 32 bits, which we might in rare
  // cases want to overflow. A 64-bit float can represent 48-bit
  // integers precisely.

  var lower16 = 0xffff;
  var factor16 = Math.pow(2, 16);

  function makeRecover(index, offset) { return index + offset * factor16 }
  function recoverIndex(value) { return value & lower16 }
  function recoverOffset(value) { return (value - (value & lower16)) / factor16 }

  // ::- An object representing a mapped position with extra
  // information.
  var MapResult = function MapResult(pos, deleted, recover) {
    if ( deleted === void 0 ) deleted = false;
    if ( recover === void 0 ) recover = null;

    // :: number The mapped version of the position.
    this.pos = pos;
    // :: bool Tells you whether the position was deleted, that is,
    // whether the step removed its surroundings from the document.
    this.deleted = deleted;
    this.recover = recover;
  };

  // :: class extends Mappable
  // A map describing the deletions and insertions made by a step, which
  // can be used to find the correspondence between positions in the
  // pre-step version of a document and the same position in the
  // post-step version.
  var StepMap = function StepMap(ranges, inverted) {
    if ( inverted === void 0 ) inverted = false;

    this.ranges = ranges;
    this.inverted = inverted;
  };

  StepMap.prototype.recover = function recover (value) {
      var this$1 = this;

    var diff = 0, index = recoverIndex(value);
    if (!this.inverted) { for (var i = 0; i < index; i++)
      { diff += this$1.ranges[i * 3 + 2] - this$1.ranges[i * 3 + 1]; } }
    return this.ranges[index * 3] + diff + recoverOffset(value)
  };

  // : (number, ?number) → MapResult
  StepMap.prototype.mapResult = function mapResult (pos, assoc) {
    if ( assoc === void 0 ) assoc = 1;
   return this._map(pos, assoc, false) };

  // : (number, ?number) → number
  StepMap.prototype.map = function map (pos, assoc) {
    if ( assoc === void 0 ) assoc = 1;
   return this._map(pos, assoc, true) };

  StepMap.prototype._map = function _map (pos, assoc, simple) {
      var this$1 = this;

    var diff = 0, oldIndex = this.inverted ? 2 : 1, newIndex = this.inverted ? 1 : 2;
    for (var i = 0; i < this.ranges.length; i += 3) {
      var start = this$1.ranges[i] - (this$1.inverted ? diff : 0);
      if (start > pos) { break }
      var oldSize = this$1.ranges[i + oldIndex], newSize = this$1.ranges[i + newIndex], end = start + oldSize;
      if (pos <= end) {
        var side = !oldSize ? assoc : pos == start ? -1 : pos == end ? 1 : assoc;
        var result = start + diff + (side < 0 ? 0 : newSize);
        if (simple) { return result }
        var recover = makeRecover(i / 3, pos - start);
        return new MapResult(result, assoc < 0 ? pos != start : pos != end, recover)
      }
      diff += newSize - oldSize;
    }
    return simple ? pos + diff : new MapResult(pos + diff)
  };

  StepMap.prototype.touches = function touches (pos, recover) {
      var this$1 = this;

    var diff = 0, index = recoverIndex(recover);
    var oldIndex = this.inverted ? 2 : 1, newIndex = this.inverted ? 1 : 2;
    for (var i = 0; i < this.ranges.length; i += 3) {
      var start = this$1.ranges[i] - (this$1.inverted ? diff : 0);
      if (start > pos) { break }
      var oldSize = this$1.ranges[i + oldIndex], end = start + oldSize;
      if (pos <= end && i == index * 3) { return true }
      diff += this$1.ranges[i + newIndex] - oldSize;
    }
    return false
  };

  // :: ((oldStart: number, oldEnd: number, newStart: number, newEnd: number))
  // Calls the given function on each of the changed ranges included in
  // this map.
  StepMap.prototype.forEach = function forEach (f) {
      var this$1 = this;

    var oldIndex = this.inverted ? 2 : 1, newIndex = this.inverted ? 1 : 2;
    for (var i = 0, diff = 0; i < this.ranges.length; i += 3) {
      var start = this$1.ranges[i], oldStart = start - (this$1.inverted ? diff : 0), newStart = start + (this$1.inverted ? 0 : diff);
      var oldSize = this$1.ranges[i + oldIndex], newSize = this$1.ranges[i + newIndex];
      f(oldStart, oldStart + oldSize, newStart, newStart + newSize);
      diff += newSize - oldSize;
    }
  };

  // :: () → StepMap
  // Create an inverted version of this map. The result can be used to
  // map positions in the post-step document to the pre-step document.
  StepMap.prototype.invert = function invert () {
    return new StepMap(this.ranges, !this.inverted)
  };

  StepMap.prototype.toString = function toString () {
    return (this.inverted ? "-" : "") + JSON.stringify(this.ranges)
  };

  // :: (n: number) → StepMap
  // Create a map that moves all positions by offset `n` (which may be
  // negative). This can be useful when applying steps meant for a
  // sub-document to a larger document, or vice-versa.
  StepMap.offset = function offset (n) {
    return n == 0 ? StepMap.empty : new StepMap(n < 0 ? [0, -n, 0] : [0, 0, n])
  };

  StepMap.empty = new StepMap([]);

  // :: class extends Mappable
  // A mapping represents a pipeline of zero or more [step
  // maps](#transform.StepMap). It has special provisions for losslessly
  // handling mapping positions through a series of steps in which some
  // steps are inverted versions of earlier steps. (This comes up when
  // ‘[rebasing](/docs/guide/#transform.rebasing)’ steps for
  // collaboration or history management.)
  var Mapping = function Mapping(maps, mirror, from, to) {
    // :: [StepMap]
    // The step maps in this mapping.
    this.maps = maps || [];
    // :: number
    // The starting position in the `maps` array, used when `map` or
    // `mapResult` is called.
    this.from = from || 0;
    // :: number
    // The end position in the `maps` array.
    this.to = to == null ? this.maps.length : to;
    this.mirror = mirror;
  };

  // :: (?number, ?number) → Mapping
  // Create a mapping that maps only through a part of this one.
  Mapping.prototype.slice = function slice (from, to) {
      if ( from === void 0 ) from = 0;
      if ( to === void 0 ) to = this.maps.length;

    return new Mapping(this.maps, this.mirror, from, to)
  };

  Mapping.prototype.copy = function copy () {
    return new Mapping(this.maps.slice(), this.mirror && this.mirror.slice(), this.from, this.to)
  };

  // :: (StepMap, ?number)
  // Add a step map to the end of this mapping. If `mirrors` is
  // given, it should be the index of the step map that is the mirror
  // image of this one.
  Mapping.prototype.appendMap = function appendMap (map, mirrors) {
    this.to = this.maps.push(map);
    if (mirrors != null) { this.setMirror(this.maps.length - 1, mirrors); }
  };

  // :: (Mapping)
  // Add all the step maps in a given mapping to this one (preserving
  // mirroring information).
  Mapping.prototype.appendMapping = function appendMapping (mapping) {
      var this$1 = this;

    for (var i = 0, startSize = this.maps.length; i < mapping.maps.length; i++) {
      var mirr = mapping.getMirror(i);
      this$1.appendMap(mapping.maps[i], mirr != null && mirr < i ? startSize + mirr : null);
    }
  };

  // :: (number) → ?number
  // Finds the offset of the step map that mirrors the map at the
  // given offset, in this mapping (as per the second argument to
  // `appendMap`).
  Mapping.prototype.getMirror = function getMirror (n) {
      var this$1 = this;

    if (this.mirror) { for (var i = 0; i < this.mirror.length; i++)
      { if (this$1.mirror[i] == n) { return this$1.mirror[i + (i % 2 ? -1 : 1)] } } }
  };

  Mapping.prototype.setMirror = function setMirror (n, m) {
    if (!this.mirror) { this.mirror = []; }
    this.mirror.push(n, m);
  };

  // :: (Mapping)
  // Append the inverse of the given mapping to this one.
  Mapping.prototype.appendMappingInverted = function appendMappingInverted (mapping) {
      var this$1 = this;

    for (var i = mapping.maps.length - 1, totalSize = this.maps.length + mapping.maps.length; i >= 0; i--) {
      var mirr = mapping.getMirror(i);
      this$1.appendMap(mapping.maps[i].invert(), mirr != null && mirr > i ? totalSize - mirr - 1 : null);
    }
  };

  // () → Mapping
  // Create an inverted version of this mapping.
  Mapping.prototype.invert = function invert () {
    var inverse = new Mapping;
    inverse.appendMappingInverted(this);
    return inverse
  };

  // : (number, ?number) → number
  // Map a position through this mapping.
  Mapping.prototype.map = function map (pos, assoc) {
      var this$1 = this;
      if ( assoc === void 0 ) assoc = 1;

    if (this.mirror) { return this._map(pos, assoc, true) }
    for (var i = this.from; i < this.to; i++)
      { pos = this$1.maps[i].map(pos, assoc); }
    return pos
  };

  // : (number, ?number) → MapResult
  // Map a position through this mapping, returning a mapping
  // result.
  Mapping.prototype.mapResult = function mapResult (pos, assoc) {
    if ( assoc === void 0 ) assoc = 1;
   return this._map(pos, assoc, false) };

  Mapping.prototype._map = function _map (pos, assoc, simple) {
      var this$1 = this;

    var deleted = false, recoverables = null;

    for (var i = this.from; i < this.to; i++) {
      var map = this$1.maps[i], rec = recoverables && recoverables[i];
      if (rec != null && map.touches(pos, rec)) {
        pos = map.recover(rec);
        continue
      }

      var result = map.mapResult(pos, assoc);
      if (result.recover != null) {
        var corr = this$1.getMirror(i);
        if (corr != null && corr > i && corr < this$1.to) {
          if (result.deleted) {
            i = corr;
            pos = this$1.maps[corr].recover(result.recover);
            continue
          } else {
            (recoverables || (recoverables = Object.create(null)))[corr] = result.recover;
          }
        }
      }

      if (result.deleted) { deleted = true; }
      pos = result.pos;
    }

    return simple ? pos : new MapResult(pos, deleted)
  };

  function TransformError(message) {
    var err = Error.call(this, message);
    err.__proto__ = TransformError.prototype;
    return err
  }

  TransformError.prototype = Object.create(Error.prototype);
  TransformError.prototype.constructor = TransformError;
  TransformError.prototype.name = "TransformError";

  // ::- Abstraction to build up and track an array of
  // [steps](#transform.Step) representing a document transformation.
  //
  // Most transforming methods return the `Transform` object itself, so
  // that they can be chained.
  var Transform = function Transform(doc) {
    // :: Node
    // The current document (the result of applying the steps in the
    // transform).
    this.doc = doc;
    // :: [Step]
    // The steps in this transform.
    this.steps = [];
    // :: [Node]
    // The documents before each of the steps.
    this.docs = [];
    // :: Mapping
    // A mapping with the maps for each of the steps in this transform.
    this.mapping = new Mapping;
  };

  var prototypeAccessors = { before: {},docChanged: {} };

  // :: Node The starting document.
  prototypeAccessors.before.get = function () { return this.docs.length ? this.docs[0] : this.doc };

  // :: (step: Step) → this
  // Apply a new step in this transform, saving the result. Throws an
  // error when the step fails.
  Transform.prototype.step = function step (object) {
    var result = this.maybeStep(object);
    if (result.failed) { throw new TransformError(result.failed) }
    return this
  };

  // :: (Step) → StepResult
  // Try to apply a step in this transformation, ignoring it if it
  // fails. Returns the step result.
  Transform.prototype.maybeStep = function maybeStep (step) {
    var result = step.apply(this.doc);
    if (!result.failed) { this.addStep(step, result.doc); }
    return result
  };

  // :: bool
  // True when the document has been changed (when there are any
  // steps).
  prototypeAccessors.docChanged.get = function () {
    return this.steps.length > 0
  };

  Transform.prototype.addStep = function addStep (step, doc) {
    this.docs.push(this.doc);
    this.steps.push(step);
    this.mapping.appendMap(step.getMap());
    this.doc = doc;
  };

  Object.defineProperties( Transform.prototype, prototypeAccessors );

  function mustOverride() { throw new Error("Override me") }

  var stepsByID = Object.create(null);

  // ::- A step object represents an atomic change. It generally applies
  // only to the document it was created for, since the positions
  // stored in it will only make sense for that document.
  //
  // New steps are defined by creating classes that extend `Step`,
  // overriding the `apply`, `invert`, `map`, `getMap` and `fromJSON`
  // methods, and registering your class with a unique
  // JSON-serialization identifier using
  // [`Step.jsonID`](#transform.Step^jsonID).
  var Step = function Step () {};

  Step.prototype.apply = function apply (_doc) { return mustOverride() };

  // :: () → StepMap
  // Get the step map that represents the changes made by this step,
  // and which can be used to transform between positions in the old
  // and the new document.
  Step.prototype.getMap = function getMap () { return StepMap.empty };

  // :: (doc: Node) → Step
  // Create an inverted version of this step. Needs the document as it
  // was before the step as argument.
  Step.prototype.invert = function invert (_doc) { return mustOverride() };

  // :: (mapping: Mappable) → ?Step
  // Map this step through a mappable thing, returning either a
  // version of that step with its positions adjusted, or `null` if
  // the step was entirely deleted by the mapping.
  Step.prototype.map = function map (_mapping) { return mustOverride() };

  // :: (other: Step) → ?Step
  // Try to merge this step with another one, to be applied directly
  // after it. Returns the merged step when possible, null if the
  // steps can't be merged.
  Step.prototype.merge = function merge (_other) { return null };

  // :: () → Object
  // Create a JSON-serializeable representation of this step. When
  // defining this for a custom subclass, make sure the result object
  // includes the step type's [JSON id](#transform.Step^jsonID) under
  // the `stepType` property.
  Step.prototype.toJSON = function toJSON () { return mustOverride() };

  // :: (Schema, Object) → Step
  // Deserialize a step from its JSON representation. Will call
  // through to the step class' own implementation of this method.
  Step.fromJSON = function fromJSON (schema, json) {
    if (!json || !json.stepType) { throw new RangeError("Invalid input for Step.fromJSON") }
    var type = stepsByID[json.stepType];
    if (!type) { throw new RangeError(("No step type " + (json.stepType) + " defined")) }
    return type.fromJSON(schema, json)
  };

  // :: (string, constructor<Step>)
  // To be able to serialize steps to JSON, each step needs a string
  // ID to attach to its JSON representation. Use this method to
  // register an ID for your step classes. Try to pick something
  // that's unlikely to clash with steps from other modules.
  Step.jsonID = function jsonID (id, stepClass) {
    if (id in stepsByID) { throw new RangeError("Duplicate use of step JSON ID " + id) }
    stepsByID[id] = stepClass;
    stepClass.prototype.jsonID = id;
    return stepClass
  };

  // ::- The result of [applying](#transform.Step.apply) a step. Contains either a
  // new document or a failure value.
  var StepResult = function StepResult(doc, failed) {
    // :: ?Node The transformed document.
    this.doc = doc;
    // :: ?string Text providing information about a failed step.
    this.failed = failed;
  };

  // :: (Node) → StepResult
  // Create a successful step result.
  StepResult.ok = function ok (doc) { return new StepResult(doc, null) };

  // :: (string) → StepResult
  // Create a failed step result.
  StepResult.fail = function fail (message) { return new StepResult(null, message) };

  // :: (Node, number, number, Slice) → StepResult
  // Call [`Node.replace`](#model.Node.replace) with the given
  // arguments. Create a successful result if it succeeds, and a
  // failed one if it throws a `ReplaceError`.
  StepResult.fromReplace = function fromReplace (doc, from, to, slice) {
    try {
      return StepResult.ok(doc.replace(from, to, slice))
    } catch (e) {
      if (e instanceof dist.ReplaceError) { return StepResult.fail(e.message) }
      throw e
    }
  };

  // ::- Replace a part of the document with a slice of new content.
  var ReplaceStep = (function (Step$$1) {
    function ReplaceStep(from, to, slice, structure) {
      Step$$1.call(this);
      this.from = from;
      this.to = to;
      this.slice = slice;
      this.structure = !!structure;
    }

    if ( Step$$1 ) ReplaceStep.__proto__ = Step$$1;
    ReplaceStep.prototype = Object.create( Step$$1 && Step$$1.prototype );
    ReplaceStep.prototype.constructor = ReplaceStep;

    ReplaceStep.prototype.apply = function apply (doc) {
      if (this.structure && contentBetween(doc, this.from, this.to))
        { return StepResult.fail("Structure replace would overwrite content") }
      return StepResult.fromReplace(doc, this.from, this.to, this.slice)
    };

    ReplaceStep.prototype.getMap = function getMap () {
      return new StepMap([this.from, this.to - this.from, this.slice.size])
    };

    ReplaceStep.prototype.invert = function invert (doc) {
      return new ReplaceStep(this.from, this.from + this.slice.size, doc.slice(this.from, this.to))
    };

    ReplaceStep.prototype.map = function map (mapping) {
      var from = mapping.mapResult(this.from, 1), to = mapping.mapResult(this.to, -1);
      if (from.deleted && to.deleted) { return null }
      return new ReplaceStep(from.pos, Math.max(from.pos, to.pos), this.slice)
    };

    ReplaceStep.prototype.merge = function merge (other) {
      if (!(other instanceof ReplaceStep) || other.structure != this.structure) { return null }

      if (this.from + this.slice.size == other.from && !this.slice.openEnd && !other.slice.openStart) {
        var slice = this.slice.size + other.slice.size == 0 ? dist.Slice.empty
            : new dist.Slice(this.slice.content.append(other.slice.content), this.slice.openStart, other.slice.openEnd);
        return new ReplaceStep(this.from, this.to + (other.to - other.from), slice, this.structure)
      } else if (other.to == this.from && !this.slice.openStart && !other.slice.openEnd) {
        var slice$1 = this.slice.size + other.slice.size == 0 ? dist.Slice.empty
            : new dist.Slice(other.slice.content.append(this.slice.content), other.slice.openStart, this.slice.openEnd);
        return new ReplaceStep(other.from, this.to, slice$1, this.structure)
      } else {
        return null
      }
    };

    ReplaceStep.prototype.toJSON = function toJSON () {
      var json = {stepType: "replace", from: this.from, to: this.to};
      if (this.slice.size) { json.slice = this.slice.toJSON(); }
      if (this.structure) { json.structure = true; }
      return json
    };

    ReplaceStep.fromJSON = function fromJSON (schema, json) {
      if (typeof json.from != "number" || typeof json.to != "number")
        { throw new RangeError("Invalid input for ReplaceStep.fromJSON") }
      return new ReplaceStep(json.from, json.to, dist.Slice.fromJSON(schema, json.slice), !!json.structure)
    };

    return ReplaceStep;
  }(Step));

  Step.jsonID("replace", ReplaceStep);

  // ::- Replace a part of the document with a slice of content, but
  // preserve a range of the replaced content by moving it into the
  // slice.
  var ReplaceAroundStep = (function (Step$$1) {
    function ReplaceAroundStep(from, to, gapFrom, gapTo, slice, insert, structure) {
      Step$$1.call(this);
      this.from = from;
      this.to = to;
      this.gapFrom = gapFrom;
      this.gapTo = gapTo;
      this.slice = slice;
      this.insert = insert;
      this.structure = !!structure;
    }

    if ( Step$$1 ) ReplaceAroundStep.__proto__ = Step$$1;
    ReplaceAroundStep.prototype = Object.create( Step$$1 && Step$$1.prototype );
    ReplaceAroundStep.prototype.constructor = ReplaceAroundStep;

    ReplaceAroundStep.prototype.apply = function apply (doc) {
      if (this.structure && (contentBetween(doc, this.from, this.gapFrom) ||
                             contentBetween(doc, this.gapTo, this.to)))
        { return StepResult.fail("Structure gap-replace would overwrite content") }

      var gap = doc.slice(this.gapFrom, this.gapTo);
      if (gap.openStart || gap.openEnd)
        { return StepResult.fail("Gap is not a flat range") }
      var inserted = this.slice.insertAt(this.insert, gap.content);
      if (!inserted) { return StepResult.fail("Content does not fit in gap") }
      return StepResult.fromReplace(doc, this.from, this.to, inserted)
    };

    ReplaceAroundStep.prototype.getMap = function getMap () {
      return new StepMap([this.from, this.gapFrom - this.from, this.insert,
                          this.gapTo, this.to - this.gapTo, this.slice.size - this.insert])
    };

    ReplaceAroundStep.prototype.invert = function invert (doc) {
      var gap = this.gapTo - this.gapFrom;
      return new ReplaceAroundStep(this.from, this.from + this.slice.size + gap,
                                   this.from + this.insert, this.from + this.insert + gap,
                                   doc.slice(this.from, this.to).removeBetween(this.gapFrom - this.from, this.gapTo - this.from),
                                   this.gapFrom - this.from, this.structure)
    };

    ReplaceAroundStep.prototype.map = function map (mapping) {
      var from = mapping.mapResult(this.from, 1), to = mapping.mapResult(this.to, -1);
      var gapFrom = mapping.map(this.gapFrom, -1), gapTo = mapping.map(this.gapTo, 1);
      if ((from.deleted && to.deleted) || gapFrom < from.pos || gapTo > to.pos) { return null }
      return new ReplaceAroundStep(from.pos, to.pos, gapFrom, gapTo, this.slice, this.insert, this.structure)
    };

    ReplaceAroundStep.prototype.toJSON = function toJSON () {
      var json = {stepType: "replaceAround", from: this.from, to: this.to,
                  gapFrom: this.gapFrom, gapTo: this.gapTo, insert: this.insert};
      if (this.slice.size) { json.slice = this.slice.toJSON(); }
      if (this.structure) { json.structure = true; }
      return json
    };

    ReplaceAroundStep.fromJSON = function fromJSON (schema, json) {
      if (typeof json.from != "number" || typeof json.to != "number" ||
          typeof json.gapFrom != "number" || typeof json.gapTo != "number" || typeof json.insert != "number")
        { throw new RangeError("Invalid input for ReplaceAroundStep.fromJSON") }
      return new ReplaceAroundStep(json.from, json.to, json.gapFrom, json.gapTo,
                                   dist.Slice.fromJSON(schema, json.slice), json.insert, !!json.structure)
    };

    return ReplaceAroundStep;
  }(Step));

  Step.jsonID("replaceAround", ReplaceAroundStep);

  function contentBetween(doc, from, to) {
    var $from = doc.resolve(from), dist = to - from, depth = $from.depth;
    while (dist > 0 && depth > 0 && $from.indexAfter(depth) == $from.node(depth).childCount) {
      depth--;
      dist--;
    }
    if (dist > 0) {
      var next = $from.node(depth).maybeChild($from.indexAfter(depth));
      while (dist > 0) {
        if (!next || next.isLeaf) { return true }
        next = next.firstChild;
        dist--;
      }
    }
    return false
  }

  function canCut(node, start, end) {
    return (start == 0 || node.canReplace(start, node.childCount)) &&
      (end == node.childCount || node.canReplace(0, end))
  }

  // :: (NodeRange) → ?number
  // Try to find a target depth to which the content in the given range
  // can be lifted. Will not go across
  // [isolating](#model.NodeSpec.isolating) parent nodes.
  function liftTarget(range) {
    var parent = range.parent;
    var content = parent.content.cutByIndex(range.startIndex, range.endIndex);
    for (var depth = range.depth;; --depth) {
      var node = range.$from.node(depth);
      var index = range.$from.index(depth), endIndex = range.$to.indexAfter(depth);
      if (depth < range.depth && node.canReplace(index, endIndex, content))
        { return depth }
      if (depth == 0 || node.type.spec.isolating || !canCut(node, index, endIndex)) { break }
    }
  }

  // :: (NodeRange, number) → this
  // Split the content in the given range off from its parent, if there
  // is sibling content before or after it, and move it up the tree to
  // the depth specified by `target`. You'll probably want to use
  // [`liftTarget`](#transform.liftTarget) to compute `target`, to make
  // sure the lift is valid.
  Transform.prototype.lift = function(range, target) {
    var $from = range.$from;
    var $to = range.$to;
    var depth = range.depth;

    var gapStart = $from.before(depth + 1), gapEnd = $to.after(depth + 1);
    var start = gapStart, end = gapEnd;

    var before = dist.Fragment.empty, openStart = 0;
    for (var d = depth, splitting = false; d > target; d--)
      { if (splitting || $from.index(d) > 0) {
        splitting = true;
        before = dist.Fragment.from($from.node(d).copy(before));
        openStart++;
      } else {
        start--;
      } }
    var after = dist.Fragment.empty, openEnd = 0;
    for (var d$1 = depth, splitting$1 = false; d$1 > target; d$1--)
      { if (splitting$1 || $to.after(d$1 + 1) < $to.end(d$1)) {
        splitting$1 = true;
        after = dist.Fragment.from($to.node(d$1).copy(after));
        openEnd++;
      } else {
        end++;
      } }

    return this.step(new ReplaceAroundStep(start, end, gapStart, gapEnd,
                                           new dist.Slice(before.append(after), openStart, openEnd),
                                           before.size - openStart, true))
  };

  // :: (NodeRange, NodeType, ?Object, ?NodeRange) → ?[{type: NodeType, attrs: ?Object}]
  // Try to find a valid way to wrap the content in the given range in a
  // node of the given type. May introduce extra nodes around and inside
  // the wrapper node, if necessary. Returns null if no valid wrapping
  // could be found. When `innerRange` is given, that range's content is
  // used as the content to fit into the wrapping, instead of the
  // content of `range`.
  function findWrapping(range, nodeType, attrs, innerRange) {
    if ( innerRange === void 0 ) innerRange = range;

    var around = findWrappingOutside(range, nodeType);
    var inner = around && findWrappingInside(innerRange, nodeType);
    if (!inner) { return null }
    return around.map(withAttrs).concat({type: nodeType, attrs: attrs}).concat(inner.map(withAttrs))
  }

  function withAttrs(type) { return {type: type, attrs: null} }

  function findWrappingOutside(range, type) {
    var parent = range.parent;
    var startIndex = range.startIndex;
    var endIndex = range.endIndex;
    var around = parent.contentMatchAt(startIndex).findWrapping(type);
    if (!around) { return null }
    var outer = around.length ? around[0] : type;
    return parent.canReplaceWith(startIndex, endIndex, outer) ? around : null
  }

  function findWrappingInside(range, type) {
    var parent = range.parent;
    var startIndex = range.startIndex;
    var endIndex = range.endIndex;
    var inner = parent.child(startIndex);
    var inside = type.contentMatch.findWrapping(inner.type);
    if (!inside) { return null }
    var lastType = inside.length ? inside[inside.length - 1] : type;
    var innerMatch = lastType.contentMatch;
    for (var i = startIndex; innerMatch && i < endIndex; i++)
      { innerMatch = innerMatch.matchType(parent.child(i).type); }
    if (!innerMatch || !innerMatch.validEnd) { return null }
    return inside
  }

  // :: (NodeRange, [{type: NodeType, attrs: ?Object}]) → this
  // Wrap the given [range](#model.NodeRange) in the given set of wrappers.
  // The wrappers are assumed to be valid in this position, and should
  // probably be computed with [`findWrapping`](#transform.findWrapping).
  Transform.prototype.wrap = function(range, wrappers) {
    var content = dist.Fragment.empty;
    for (var i = wrappers.length - 1; i >= 0; i--)
      { content = dist.Fragment.from(wrappers[i].type.create(wrappers[i].attrs, content)); }

    var start = range.start, end = range.end;
    return this.step(new ReplaceAroundStep(start, end, start, end, new dist.Slice(content, 0, 0), wrappers.length, true))
  };

  // :: (number, ?number, NodeType, ?Object) → this
  // Set the type of all textblocks (partly) between `from` and `to` to
  // the given node type with the given attributes.
  Transform.prototype.setBlockType = function(from, to, type, attrs) {
    var this$1 = this;
    if ( to === void 0 ) to = from;

    if (!type.isTextblock) { throw new RangeError("Type given to setBlockType should be a textblock") }
    var mapFrom = this.steps.length;
    this.doc.nodesBetween(from, to, function (node, pos) {
      if (node.isTextblock && !node.hasMarkup(type, attrs) && canChangeType(this$1.doc, this$1.mapping.slice(mapFrom).map(pos), type)) {
        // Ensure all markup that isn't allowed in the new node type is cleared
        this$1.clearIncompatible(this$1.mapping.slice(mapFrom).map(pos, 1), type);
        var mapping = this$1.mapping.slice(mapFrom);
        var startM = mapping.map(pos, 1), endM = mapping.map(pos + node.nodeSize, 1);
        this$1.step(new ReplaceAroundStep(startM, endM, startM + 1, endM - 1,
                                        new dist.Slice(dist.Fragment.from(type.create(attrs, null, node.marks)), 0, 0), 1, true));
        return false
      }
    });
    return this
  };

  function canChangeType(doc, pos, type) {
    var $pos = doc.resolve(pos), index = $pos.index();
    return $pos.parent.canReplaceWith(index, index + 1, type)
  }

  // :: (number, ?NodeType, ?Object, ?[Mark]) → this
  // Change the type, attributes, and/or marks of the node at `pos`.
  // When `type` isn't given, the existing node type is preserved,
  Transform.prototype.setNodeMarkup = function(pos, type, attrs, marks) {
    var node = this.doc.nodeAt(pos);
    if (!node) { throw new RangeError("No node at given position") }
    if (!type) { type = node.type; }
    var newNode = type.create(attrs, null, marks || node.marks);
    if (node.isLeaf)
      { return this.replaceWith(pos, pos + node.nodeSize, newNode) }

    if (!type.validContent(node.content))
      { throw new RangeError("Invalid content for node type " + type.name) }

    return this.step(new ReplaceAroundStep(pos, pos + node.nodeSize, pos + 1, pos + node.nodeSize - 1,
                                           new dist.Slice(dist.Fragment.from(newNode), 0, 0), 1, true))
  };

  // :: (Node, number, number, ?[?{type: NodeType, attrs: ?Object}]) → bool
  // Check whether splitting at the given position is allowed.
  function canSplit(doc, pos, depth, typesAfter) {
    if ( depth === void 0 ) depth = 1;

    var $pos = doc.resolve(pos), base = $pos.depth - depth;
    var innerType = (typesAfter && typesAfter[typesAfter.length - 1]) || $pos.parent;
    if (base < 0 || $pos.parent.type.spec.isolating ||
        !$pos.parent.canReplace($pos.index(), $pos.parent.childCount) ||
        !innerType.type.validContent($pos.parent.content.cutByIndex($pos.index(), $pos.parent.childCount)))
      { return false }
    for (var d = $pos.depth - 1, i = depth - 2; d > base; d--, i--) {
      var node = $pos.node(d), index$1 = $pos.index(d);
      if (node.type.spec.isolating) { return false }
      var rest = node.content.cutByIndex(index$1, node.childCount);
      var after = (typesAfter && typesAfter[i]) || node;
      if (after != node) { rest = rest.replaceChild(0, after.type.create(after.attrs)); }
      if (!node.canReplace(index$1 + 1, node.childCount) || !after.type.validContent(rest))
        { return false }
    }
    var index = $pos.indexAfter(base);
    var baseType = typesAfter && typesAfter[0];
    return $pos.node(base).canReplaceWith(index, index, baseType ? baseType.type : $pos.node(base + 1).type)
  }

  // :: (number, ?number, ?[?{type: NodeType, attrs: ?Object}]) → this
  // Split the node at the given position, and optionally, if `depth` is
  // greater than one, any number of nodes above that. By default, the
  // parts split off will inherit the node type of the original node.
  // This can be changed by passing an array of types and attributes to
  // use after the split.
  Transform.prototype.split = function(pos, depth, typesAfter) {
    if ( depth === void 0 ) depth = 1;

    var $pos = this.doc.resolve(pos), before = dist.Fragment.empty, after = dist.Fragment.empty;
    for (var d = $pos.depth, e = $pos.depth - depth, i = depth - 1; d > e; d--, i--) {
      before = dist.Fragment.from($pos.node(d).copy(before));
      var typeAfter = typesAfter && typesAfter[i];
      after = dist.Fragment.from(typeAfter ? typeAfter.type.create(typeAfter.attrs, after) : $pos.node(d).copy(after));
    }
    return this.step(new ReplaceStep(pos, pos, new dist.Slice(before.append(after), depth, depth, true)))
  };

  // :: (Node, number) → bool
  // Test whether the blocks before and after a given position can be
  // joined.
  function canJoin(doc, pos) {
    var $pos = doc.resolve(pos), index = $pos.index();
    return joinable($pos.nodeBefore, $pos.nodeAfter) &&
      $pos.parent.canReplace(index, index + 1)
  }

  function joinable(a, b) {
    return a && b && !a.isLeaf && a.canAppend(b)
  }

  // :: (Node, number, ?number) → ?number
  // Find an ancestor of the given position that can be joined to the
  // block before (or after if `dir` is positive). Returns the joinable
  // point, if any.
  function joinPoint(doc, pos, dir) {
    if ( dir === void 0 ) dir = -1;

    var $pos = doc.resolve(pos);
    for (var d = $pos.depth;; d--) {
      var before = (void 0), after = (void 0);
      if (d == $pos.depth) {
        before = $pos.nodeBefore;
        after = $pos.nodeAfter;
      } else if (dir > 0) {
        before = $pos.node(d + 1);
        after = $pos.node(d).maybeChild($pos.index(d) + 1);
      } else {
        before = $pos.node(d).maybeChild($pos.index(d) - 1);
        after = $pos.node(d + 1);
      }
      if (before && !before.isTextblock && joinable(before, after)) { return pos }
      if (d == 0) { break }
      pos = dir < 0 ? $pos.before(d) : $pos.after(d);
    }
  }

  // :: (number, ?number) → this
  // Join the blocks around the given position. If depth is 2, their
  // last and first siblings are also joined, and so on.
  Transform.prototype.join = function(pos, depth) {
    if ( depth === void 0 ) depth = 1;

    var step = new ReplaceStep(pos - depth, pos + depth, dist.Slice.empty, true);
    return this.step(step)
  };

  // :: (Node, number, NodeType) → ?number
  // Try to find a point where a node of the given type can be inserted
  // near `pos`, by searching up the node hierarchy when `pos` itself
  // isn't a valid place but is at the start or end of a node. Return
  // null if no position was found.
  function insertPoint(doc, pos, nodeType) {
    var $pos = doc.resolve(pos);
    if ($pos.parent.canReplaceWith($pos.index(), $pos.index(), nodeType)) { return pos }

    if ($pos.parentOffset == 0)
      { for (var d = $pos.depth - 1; d >= 0; d--) {
        var index = $pos.index(d);
        if ($pos.node(d).canReplaceWith(index, index, nodeType)) { return $pos.before(d + 1) }
        if (index > 0) { return null }
      } }
    if ($pos.parentOffset == $pos.parent.content.size)
      { for (var d$1 = $pos.depth - 1; d$1 >= 0; d$1--) {
        var index$1 = $pos.indexAfter(d$1);
        if ($pos.node(d$1).canReplaceWith(index$1, index$1, nodeType)) { return $pos.after(d$1 + 1) }
        if (index$1 < $pos.node(d$1).childCount) { return null }
      } }
  }

  // :: (Node, number, Slice) → ?number
  // Finds a position at or around the given position where the given
  // slice can be inserted. Will look at parent nodes' nearest boundary
  // and try there, even if the original position wasn't directly at the
  // start or end of that node. Returns null when no position was found.
  function dropPoint(doc, pos, slice) {
    var $pos = doc.resolve(pos);
    if (!slice.content.size) { return pos }
    var content = slice.content;
    for (var i = 0; i < slice.openStart; i++) { content = content.firstChild.content; }
    for (var pass = 1; pass <= (slice.openStart == 0 && slice.size ? 2 : 1); pass++) {
      for (var d = $pos.depth; d >= 0; d--) {
        var bias = d == $pos.depth ? 0 : $pos.pos <= ($pos.start(d + 1) + $pos.end(d + 1)) / 2 ? -1 : 1;
        var insertPos = $pos.index(d) + (bias > 0 ? 1 : 0);
        if (pass == 1
            ? $pos.node(d).canReplace(insertPos, insertPos, content)
            : $pos.node(d).contentMatchAt(insertPos).findWrapping(content.firstChild.type))
          { return bias == 0 ? $pos.pos : bias < 0 ? $pos.before(d + 1) : $pos.after(d + 1) }
      }
    }
    return null
  }

  function mapFragment(fragment, f, parent) {
    var mapped = [];
    for (var i = 0; i < fragment.childCount; i++) {
      var child = fragment.child(i);
      if (child.content.size) { child = child.copy(mapFragment(child.content, f, child)); }
      if (child.isInline) { child = f(child, parent, i); }
      mapped.push(child);
    }
    return dist.Fragment.fromArray(mapped)
  }

  // ::- Add a mark to all inline content between two positions.
  var AddMarkStep = (function (Step$$1) {
    function AddMarkStep(from, to, mark) {
      Step$$1.call(this);
      this.from = from;
      this.to = to;
      this.mark = mark;
    }

    if ( Step$$1 ) AddMarkStep.__proto__ = Step$$1;
    AddMarkStep.prototype = Object.create( Step$$1 && Step$$1.prototype );
    AddMarkStep.prototype.constructor = AddMarkStep;

    AddMarkStep.prototype.apply = function apply (doc) {
      var this$1 = this;

      var oldSlice = doc.slice(this.from, this.to), $from = doc.resolve(this.from);
      var parent = $from.node($from.sharedDepth(this.to));
      var slice = new dist.Slice(mapFragment(oldSlice.content, function (node, parent) {
        if (!parent.type.allowsMarkType(this$1.mark.type)) { return node }
        return node.mark(this$1.mark.addToSet(node.marks))
      }, parent), oldSlice.openStart, oldSlice.openEnd);
      return StepResult.fromReplace(doc, this.from, this.to, slice)
    };

    AddMarkStep.prototype.invert = function invert () {
      return new RemoveMarkStep(this.from, this.to, this.mark)
    };

    AddMarkStep.prototype.map = function map (mapping) {
      var from = mapping.mapResult(this.from, 1), to = mapping.mapResult(this.to, -1);
      if (from.deleted && to.deleted || from.pos >= to.pos) { return null }
      return new AddMarkStep(from.pos, to.pos, this.mark)
    };

    AddMarkStep.prototype.merge = function merge (other) {
      if (other instanceof AddMarkStep &&
          other.mark.eq(this.mark) &&
          this.from <= other.to && this.to >= other.from)
        { return new AddMarkStep(Math.min(this.from, other.from),
                               Math.max(this.to, other.to), this.mark) }
    };

    AddMarkStep.prototype.toJSON = function toJSON () {
      return {stepType: "addMark", mark: this.mark.toJSON(),
              from: this.from, to: this.to}
    };

    AddMarkStep.fromJSON = function fromJSON (schema, json) {
      if (typeof json.from != "number" || typeof json.to != "number")
        { throw new RangeError("Invalid input for AddMarkStep.fromJSON") }
      return new AddMarkStep(json.from, json.to, schema.markFromJSON(json.mark))
    };

    return AddMarkStep;
  }(Step));

  Step.jsonID("addMark", AddMarkStep);

  // ::- Remove a mark from all inline content between two positions.
  var RemoveMarkStep = (function (Step$$1) {
    function RemoveMarkStep(from, to, mark) {
      Step$$1.call(this);
      this.from = from;
      this.to = to;
      this.mark = mark;
    }

    if ( Step$$1 ) RemoveMarkStep.__proto__ = Step$$1;
    RemoveMarkStep.prototype = Object.create( Step$$1 && Step$$1.prototype );
    RemoveMarkStep.prototype.constructor = RemoveMarkStep;

    RemoveMarkStep.prototype.apply = function apply (doc) {
      var this$1 = this;

      var oldSlice = doc.slice(this.from, this.to);
      var slice = new dist.Slice(mapFragment(oldSlice.content, function (node) {
        return node.mark(this$1.mark.removeFromSet(node.marks))
      }), oldSlice.openStart, oldSlice.openEnd);
      return StepResult.fromReplace(doc, this.from, this.to, slice)
    };

    RemoveMarkStep.prototype.invert = function invert () {
      return new AddMarkStep(this.from, this.to, this.mark)
    };

    RemoveMarkStep.prototype.map = function map (mapping) {
      var from = mapping.mapResult(this.from, 1), to = mapping.mapResult(this.to, -1);
      if (from.deleted && to.deleted || from.pos >= to.pos) { return null }
      return new RemoveMarkStep(from.pos, to.pos, this.mark)
    };

    RemoveMarkStep.prototype.merge = function merge (other) {
      if (other instanceof RemoveMarkStep &&
          other.mark.eq(this.mark) &&
          this.from <= other.to && this.to >= other.from)
        { return new RemoveMarkStep(Math.min(this.from, other.from),
                                  Math.max(this.to, other.to), this.mark) }
    };

    RemoveMarkStep.prototype.toJSON = function toJSON () {
      return {stepType: "removeMark", mark: this.mark.toJSON(),
              from: this.from, to: this.to}
    };

    RemoveMarkStep.fromJSON = function fromJSON (schema, json) {
      if (typeof json.from != "number" || typeof json.to != "number")
        { throw new RangeError("Invalid input for RemoveMarkStep.fromJSON") }
      return new RemoveMarkStep(json.from, json.to, schema.markFromJSON(json.mark))
    };

    return RemoveMarkStep;
  }(Step));

  Step.jsonID("removeMark", RemoveMarkStep);

  // :: (number, number, Mark) → this
  // Add the given mark to the inline content between `from` and `to`.
  Transform.prototype.addMark = function(from, to, mark) {
    var this$1 = this;

    var removed = [], added = [], removing = null, adding = null;
    this.doc.nodesBetween(from, to, function (node, pos, parent) {
      if (!node.isInline) { return }
      var marks = node.marks;
      if (!mark.isInSet(marks) && parent.type.allowsMarkType(mark.type)) {
        var start = Math.max(pos, from), end = Math.min(pos + node.nodeSize, to);
        var newSet = mark.addToSet(marks);

        for (var i = 0; i < marks.length; i++) {
          if (!marks[i].isInSet(newSet)) {
            if (removing && removing.to == start && removing.mark.eq(marks[i]))
              { removing.to = end; }
            else
              { removed.push(removing = new RemoveMarkStep(start, end, marks[i])); }
          }
        }

        if (adding && adding.to == start)
          { adding.to = end; }
        else
          { added.push(adding = new AddMarkStep(start, end, mark)); }
      }
    });

    removed.forEach(function (s) { return this$1.step(s); });
    added.forEach(function (s) { return this$1.step(s); });
    return this
  };

  // :: (number, number, ?union<Mark, MarkType>) → this
  // Remove marks from inline nodes between `from` and `to`. When `mark`
  // is a single mark, remove precisely that mark. When it is a mark type,
  // remove all marks of that type. When it is null, remove all marks of
  // any type.
  Transform.prototype.removeMark = function(from, to, mark) {
    var this$1 = this;
    if ( mark === void 0 ) mark = null;

    var matched = [], step = 0;
    this.doc.nodesBetween(from, to, function (node, pos) {
      if (!node.isInline) { return }
      step++;
      var toRemove = null;
      if (mark instanceof dist.MarkType) {
        var found = mark.isInSet(node.marks);
        if (found) { toRemove = [found]; }
      } else if (mark) {
        if (mark.isInSet(node.marks)) { toRemove = [mark]; }
      } else {
        toRemove = node.marks;
      }
      if (toRemove && toRemove.length) {
        var end = Math.min(pos + node.nodeSize, to);
        for (var i = 0; i < toRemove.length; i++) {
          var style = toRemove[i], found$1 = (void 0);
          for (var j = 0; j < matched.length; j++) {
            var m = matched[j];
            if (m.step == step - 1 && style.eq(matched[j].style)) { found$1 = m; }
          }
          if (found$1) {
            found$1.to = end;
            found$1.step = step;
          } else {
            matched.push({style: style, from: Math.max(pos, from), to: end, step: step});
          }
        }
      }
    });
    matched.forEach(function (m) { return this$1.step(new RemoveMarkStep(m.from, m.to, m.style)); });
    return this
  };

  // :: (number, NodeType, ?ContentMatch) → this
  // Removes all marks and nodes from the content of the node at `pos`
  // that don't match the given new parent node type. Accepts an
  // optional starting [content match](#model.ContentMatch) as third
  // argument.
  Transform.prototype.clearIncompatible = function(pos, parentType, match) {
    var this$1 = this;
    if ( match === void 0 ) match = parentType.contentMatch;

    var node = this.doc.nodeAt(pos);
    var delSteps = [], cur = pos + 1;
    for (var i = 0; i < node.childCount; i++) {
      var child = node.child(i), end = cur + child.nodeSize;
      var allowed = match.matchType(child.type, child.attrs);
      if (!allowed) {
        delSteps.push(new ReplaceStep(cur, end, dist.Slice.empty));
      } else {
        match = allowed;
        for (var j = 0; j < child.marks.length; j++) { if (!parentType.allowsMarkType(child.marks[j].type))
          { this$1.step(new RemoveMarkStep(cur, end, child.marks[j])); } }
      }
      cur = end;
    }
    if (!match.validEnd) {
      var fill = match.fillBefore(dist.Fragment.empty, true);
      this.replace(cur, cur, new dist.Slice(fill, 0, 0));
    }
    for (var i$1 = delSteps.length - 1; i$1 >= 0; i$1--) { this$1.step(delSteps[i$1]); }
    return this
  };

  // :: (Node, number, ?number, ?Slice) → ?Step
  // ‘Fit’ a slice into a given position in the document, producing a
  // [step](#transform.Step) that inserts it. Will return null if
  // there's no meaningful way to insert the slice here, or inserting it
  // would be a no-op (an empty slice over an empty range).
  function replaceStep(doc, from, to, slice) {
    if ( to === void 0 ) to = from;
    if ( slice === void 0 ) slice = dist.Slice.empty;

    if (from == to && !slice.size) { return null }

    var $from = doc.resolve(from), $to = doc.resolve(to);
    // Optimization -- avoid work if it's obvious that it's not needed.
    if (fitsTrivially($from, $to, slice)) { return new ReplaceStep(from, to, slice) }
    var placed = placeSlice($from, slice);

    var fittedLeft = fitLeft($from, placed);
    var fitted = fitRight($from, $to, fittedLeft);
    if (!fitted) { return null }
    if (fittedLeft.size != fitted.size && canMoveText($from, $to, fittedLeft)) {
      var d = $to.depth, after = $to.after(d);
      while (d > 1 && after == $to.end(--d)) { ++after; }
      var fittedAfter = fitRight($from, doc.resolve(after), fittedLeft);
      if (fittedAfter)
        { return new ReplaceAroundStep(from, after, to, $to.end(), fittedAfter, fittedLeft.size) }
    }
    return fitted.size || from != to ? new ReplaceStep(from, to, fitted) : null
  }

  // :: (number, ?number, ?Slice) → this
  // Replace the part of the document between `from` and `to` with the
  // given `slice`.
  Transform.prototype.replace = function(from, to, slice) {
    if ( to === void 0 ) to = from;
    if ( slice === void 0 ) slice = dist.Slice.empty;

    var step = replaceStep(this.doc, from, to, slice);
    if (step) { this.step(step); }
    return this
  };

  // :: (number, number, union<Fragment, Node, [Node]>) → this
  // Replace the given range with the given content, which may be a
  // fragment, node, or array of nodes.
  Transform.prototype.replaceWith = function(from, to, content) {
    return this.replace(from, to, new dist.Slice(dist.Fragment.from(content), 0, 0))
  };

  // :: (number, number) → this
  // Delete the content between the given positions.
  Transform.prototype.delete = function(from, to) {
    return this.replace(from, to, dist.Slice.empty)
  };

  // :: (number, union<Fragment, Node, [Node]>) → this
  // Insert the given content at the given position.
  Transform.prototype.insert = function(pos, content) {
    return this.replaceWith(pos, pos, content)
  };



  function fitLeftInner($from, depth, placed, placedBelow) {
    var content = dist.Fragment.empty, openEnd = 0, placedHere = placed[depth];
    if ($from.depth > depth) {
      var inner = fitLeftInner($from, depth + 1, placed, placedBelow || placedHere);
      openEnd = inner.openEnd + 1;
      content = dist.Fragment.from($from.node(depth + 1).copy(inner.content));
    }

    if (placedHere) {
      content = content.append(placedHere.content);
      openEnd = placedHere.openEnd;
    }
    if (placedBelow) {
      content = content.append($from.node(depth).contentMatchAt($from.indexAfter(depth)).fillBefore(dist.Fragment.empty, true));
      openEnd = 0;
    }

    return {content: content, openEnd: openEnd}
  }

  function fitLeft($from, placed) {
    var ref = fitLeftInner($from, 0, placed, false);
    var content = ref.content;
    var openEnd = ref.openEnd;
    return new dist.Slice(content, $from.depth, openEnd || 0)
  }

  function fitRightJoin(content, parent, $from, $to, depth, openStart, openEnd) {
    var match, count = content.childCount, matchCount = count - (openEnd > 0 ? 1 : 0);
    var parentNode = openStart < 0 ? parent : $from.node(depth);
    if (openStart < 0)
      { match = parentNode.contentMatchAt(matchCount); }
    else if (count == 1 && openEnd > 0)
      { match = parentNode.contentMatchAt(openStart ? $from.index(depth) : $from.indexAfter(depth)); }
    else
      { match = parentNode.contentMatchAt($from.indexAfter(depth))
        .matchFragment(content, count > 0 && openStart ? 1 : 0, matchCount); }

    var toNode = $to.node(depth);
    if (openEnd > 0 && depth < $to.depth) {
      var after = toNode.content.cutByIndex($to.indexAfter(depth)).addToStart(content.lastChild);
      var joinable$1 = match.fillBefore(after, true);
      // Can't insert content if there's a single node stretched across this gap
      if (joinable$1 && joinable$1.size && openStart > 0 && count == 1) { joinable$1 = null; }

      if (joinable$1) {
        var inner = fitRightJoin(content.lastChild.content, content.lastChild, $from, $to,
                                 depth + 1, count == 1 ? openStart - 1 : -1, openEnd - 1);
        if (inner) {
          var last = content.lastChild.copy(inner);
          if (joinable$1.size)
            { return content.cutByIndex(0, count - 1).append(joinable$1).addToEnd(last) }
          else
            { return content.replaceChild(count - 1, last) }
        }
      }
    }
    if (openEnd > 0)
      { match = match.matchType((count == 1 && openStart > 0 ? $from.node(depth + 1) : content.lastChild).type); }

    // If we're here, the next level can't be joined, so we see what
    // happens if we leave it open.
    var toIndex = $to.index(depth);
    if (toIndex == toNode.childCount && !toNode.type.compatibleContent(parent.type)) { return null }
    var joinable = match.fillBefore(toNode.content, true, toIndex);
    for (var i = toIndex; joinable && i < toNode.content.childCount; i++)
      { if (!parentNode.type.allowsMarks(toNode.content.child(i).marks)) { joinable = null; } }
    if (!joinable) { return null }

    if (openEnd > 0) {
      var closed = fitRightClosed(content.lastChild, openEnd - 1, $from, depth + 1,
                                  count == 1 ? openStart - 1 : -1);
      content = content.replaceChild(count - 1, closed);
    }
    content = content.append(joinable);
    if ($to.depth > depth)
      { content = content.addToEnd(fitRightSeparate($to, depth + 1)); }
    return content
  }

  function fitRightClosed(node, openEnd, $from, depth, openStart) {
    var match, content = node.content, count = content.childCount;
    if (openStart >= 0)
      { match = $from.node(depth).contentMatchAt($from.indexAfter(depth))
        .matchFragment(content, openStart > 0 ? 1 : 0, count); }
    else
      { match = node.contentMatchAt(count); }

    if (openEnd > 0) {
      var closed = fitRightClosed(content.lastChild, openEnd - 1, $from, depth + 1,
                                  count == 1 ? openStart - 1 : -1);
      content = content.replaceChild(count - 1, closed);
    }

    return node.copy(content.append(match.fillBefore(dist.Fragment.empty, true)))
  }

  function fitRightSeparate($to, depth) {
    var node = $to.node(depth);
    var fill = node.contentMatchAt(0).fillBefore(node.content, true, $to.index(depth));
    if ($to.depth > depth) { fill = fill.addToEnd(fitRightSeparate($to, depth + 1)); }
    return node.copy(fill)
  }

  function normalizeSlice(content, openStart, openEnd) {
    while (openStart > 0 && openEnd > 0 && content.childCount == 1) {
      content = content.firstChild.content;
      openStart--;
      openEnd--;
    }
    return new dist.Slice(content, openStart, openEnd)
  }

  // : (ResolvedPos, ResolvedPos, number, Slice) → Slice
  function fitRight($from, $to, slice) {
    var fitted = fitRightJoin(slice.content, $from.node(0), $from, $to, 0, slice.openStart, slice.openEnd);
    if (!fitted) { return null }
    return normalizeSlice(fitted, slice.openStart, $to.depth)
  }

  function fitsTrivially($from, $to, slice) {
    return !slice.openStart && !slice.openEnd && $from.start() == $to.start() &&
      $from.parent.canReplace($from.index(), $to.index(), slice.content)
  }

  function canMoveText($from, $to, slice) {
    if (!$to.parent.isTextblock) { return false }

    var parent = slice.openEnd ? nodeRight(slice.content, slice.openEnd)
        : $from.node($from.depth - (slice.openStart - slice.openEnd));
    if (!parent.isTextblock) { return false }
    for (var i = $to.index(); i < $to.parent.childCount; i++)
      { if (!parent.type.allowsMarks($to.parent.child(i).marks)) { return false } }
    var match;
    if (slice.openEnd) {
      match = parent.contentMatchAt(parent.childCount);
    } else {
      match = parent.contentMatchAt(parent.childCount);
      if (slice.size) { match = match.matchFragment(slice.content, slice.openStart ? 1 : 0); }
    }
    match = match.matchFragment($to.parent.content, $to.index());
    return match && match.validEnd
  }

  function nodeRight(content, depth) {
    for (var i = 1; i < depth; i++) { content = content.lastChild.content; }
    return content.lastChild
  }

  // Algorithm for 'placing' the elements of a slice into a gap:
  //
  // We consider the content of each node that is open to the left to be
  // independently placeable. I.e. in <p("foo"), p("bar")>, when the
  // paragraph on the left is open, "foo" can be placed (somewhere on
  // the left side of the replacement gap) independently from p("bar").
  //
  // So placeSlice splits up a slice into a number of sub-slices,
  // along with information on where they can be placed on the given
  // left-side edge. It works by walking the open side of the slice,
  // from the inside out, and trying to find a landing spot for each
  // element, by simultaneously scanning over the gap side. When no
  // place is found for an open node's content, it is left in that node.

  // : (ResolvedPos, Slice) → [{content: Fragment, openEnd: number, depth: number}]
  function placeSlice($from, slice) {
    var frontier = new Frontier($from);
    for (var pass = 1; slice.size && pass <= 3; pass++)
      { slice = frontier.placeSlice(slice.content, slice.openStart, slice.openEnd, pass); }
    while (frontier.open.length) { frontier.closeNode(); }
    return frontier.placed
  }

  // Helper class that models the open side of the insert position,
  // keeping track of the content match and already inserted content
  // at each depth.
  var Frontier = function Frontier($pos) {
    var this$1 = this;

    // : [{parent: Node, match: ContentMatch, content: Fragment, wrapper: bool, openEnd: number, depth: number}]
    this.open = [];
    for (var d = 0; d <= $pos.depth; d++) {
      var parent = $pos.node(d), match = parent.contentMatchAt($pos.indexAfter(d));
      this$1.open.push({parent: parent, match: match, content: dist.Fragment.empty, wrapper: false, openEnd: 0, depth: d});
    }
    this.placed = [];
  };

  // : (Fragment, number, number, number, ?Node) → Slice
  // Tries to place the content of the given slice, and returns a
  // slice containing unplaced content.
  //
  // pass 1: try to fit directly
  // pass 2: allow wrapper nodes to be introduced
  // pass 3: allow unwrapping of nodes that aren't open
  Frontier.prototype.placeSlice = function placeSlice (fragment, openStart, openEnd, pass, parent) {
      var this$1 = this;

    if (openStart > 0) {
      var first = fragment.firstChild;
      var inner = this.placeSlice(first.content, Math.max(0, openStart - 1),
                                  openEnd && fragment.childCount == 1 ? openEnd - 1 : 0,
                                  pass, first);
      if (inner.content != first.content) {
        if (inner.content.size) {
          fragment = fragment.replaceChild(0, first.copy(inner.content));
          openStart = inner.openStart + 1;
        } else {
          if (fragment.childCount == 1) { openEnd = 0; }
          fragment = fragment.cutByIndex(1);
          openStart = 0;
        }
      }
    }
    var result = this.placeContent(fragment, openStart, openEnd, pass, parent);
    if (pass > 2 && result.size && openStart == 0) {
      for (var i = 0; i < result.content.childCount; i++) {
        var child = result.content.child(i);
        this$1.placeContent(child.content, 0,
                          openEnd && i == result.content.childCount.length - 1 ? openEnd - 1 : 0,
                          pass, child);
      }
      result = dist.Fragment.empty;
    }
    return result
  };

  Frontier.prototype.placeContent = function placeContent (fragment, openStart, openEnd, pass, parent) {
      var this$1 = this;

    var i = 0;
    // Go over the fragment's children
    for (; i < fragment.childCount; i++) {
      var child = fragment.child(i), placed = false, last = i == fragment.childCount - 1;
      // Try each open node in turn, starting from the innermost
      for (var d = this.open.length - 1; d >= 0; d--) {
        var open = this$1.open[d], wrap = (void 0);

        // If pass > 1, it is allowed to wrap the node to help find a
        // fit, so if findWrappeing returns something, we add open
        // nodes to the frontier for that wrapping.
        if (pass > 1 && (wrap = open.match.findWrapping(child.type)) &&
            !(parent && wrap.length && wrap[wrap.length - 1] == parent.type)) {
          while (this.open.length - 1 > d) { this$1.closeNode(); }
          for (var w = 0; w < wrap.length; w++) {
            open.match = open.match.matchType(wrap[w]);
            d++;
            open = {parent: wrap[w].create(),
                    match: wrap[w].contentMatch,
                    content: dist.Fragment.empty, wrapper: true, openEnd: 0, depth: d + w};
            this$1.open.push(open);
          }
        }

        // See if the child fits here
        var match = open.match.matchType(child.type);
        if (!match) {
          var fill = open.match.fillBefore(dist.Fragment.from(child));
          if (fill) {
            for (var j = 0; j < fill.childCount; j++) {
              var ch = fill.child(j);
              this$1.addNode(open, ch, 0);
              match = open.match.matchFragment(ch);
            }
          } else if (parent && open.match.matchType(parent.type)) {
            // Don't continue looking further up if the parent node
            // would fit here.
            break
          } else {
            continue
          }
        }

        // Close open nodes above this one, since we're starting to
        // add to this.
        while (this.open.length - 1 > d) { this$1.closeNode(); }
        // Strip marks from the child or close its start when necessary
        child = child.mark(open.parent.type.allowedMarks(child.marks));
        if (openStart) {
          child = closeNodeStart(child, openStart, last ? openEnd : 0);
          openStart = 0;
        }
        // Add the child to this open node and adjust its metadata
        this$1.addNode(open, child, last ? openEnd : 0);
        open.match = match;
        if (last) { openEnd = 0; }
        placed = true;
        break
      }
      // As soon as we've failed to place a node we stop looking at
      // later nodes
      if (!placed) { break }
    }
    // Close the current open node if it's not the the root and we
    // either placed up to the end of the node or the the current
    // slice depth's node type matches the open node's type
    if (this.open.length > 1 &&
        (i > 0 && i == fragment.childCount ||
         parent && this.open[this.open.length - 1].parent.type == parent.type))
      { this.closeNode(); }

    return new dist.Slice(fragment.cutByIndex(i), openStart, openEnd)
  };

  Frontier.prototype.addNode = function addNode (open, node, openEnd) {
    open.content = closeFragmentEnd(open.content, open.openEnd).addToEnd(node);
    open.openEnd = openEnd;
  };

  Frontier.prototype.closeNode = function closeNode () {
    var open = this.open.pop();
    if (open.content.size == 0) ; else if (open.wrapper) {
      this.addNode(this.open[this.open.length - 1], open.parent.copy(open.content), open.openEnd + 1);
    } else {
      this.placed[open.depth] = {depth: open.depth, content: open.content, openEnd: open.openEnd};
    }
  };

  function closeNodeStart(node, openStart, openEnd) {
    var content = node.content;
    if (openStart > 1) {
      var first = closeNodeStart(node.firstChild, openStart - 1, node.childCount == 1 ? openEnd - 1 : 0);
      content = node.content.replaceChild(0, first);
    }
    var fill = node.type.contentMatch.fillBefore(content, openEnd == 0);
    return node.copy(fill.append(content))
  }

  function closeNodeEnd(node, depth) {
    var content = node.content;
    if (depth > 1) {
      var last = closeNodeEnd(node.lastChild, depth - 1);
      content = node.content.replaceChild(node.childCount - 1, last);
    }
    var fill = node.contentMatchAt(node.childCount).fillBefore(dist.Fragment.empty, true);
    return node.copy(content.append(fill))
  }

  function closeFragmentEnd(fragment, depth) {
    return depth ? fragment.replaceChild(fragment.childCount - 1, closeNodeEnd(fragment.lastChild, depth)) : fragment
  }

  // :: (number, number, Slice) → this
  // Replace a range of the document with a given slice, using `from`,
  // `to`, and the slice's [`openStart`](#model.Slice.openStart) property
  // as hints, rather than fixed start and end points. This method may
  // grow the replaced area or close open nodes in the slice in order to
  // get a fit that is more in line with WYSIWYG expectations, by
  // dropping fully covered parent nodes of the replaced region when
  // they are marked [non-defining](#model.NodeSpec.defining), or
  // including an open parent node from the slice that _is_ marked as
  // [defining](#model.NodeSpec.defining).
  //
  // This is the method, for example, to handle paste. The similar
  // [`replace`](#transform.Transform.replace) method is a more
  // primitive tool which will _not_ move the start and end of its given
  // range, and is useful in situations where you need more precise
  // control over what happens.
  Transform.prototype.replaceRange = function(from, to, slice) {
    var this$1 = this;

    if (!slice.size) { return this.deleteRange(from, to) }

    var $from = this.doc.resolve(from), $to = this.doc.resolve(to);
    if (fitsTrivially($from, $to, slice))
      { return this.step(new ReplaceStep(from, to, slice)) }

    var targetDepths = coveredDepths($from, this.doc.resolve(to));
    // Can't replace the whole document, so remove 0 if it's present
    if (targetDepths[targetDepths.length - 1] == 0) { targetDepths.pop(); }
    // Negative numbers represent not expansion over the whole node at
    // that depth, but replacing from $from.before(-D) to $to.pos.
    var preferredTarget = -($from.depth + 1);
    targetDepths.unshift(preferredTarget);
    // This loop picks a preferred target depth, if one of the covering
    // depths is not outside of a defining node, and adds negative
    // depths for any depth that has $from at its start and does not
    // cross a defining node.
    for (var d = $from.depth, pos = $from.pos - 1; d > 0; d--, pos--) {
      var spec = $from.node(d).type.spec;
      if (spec.defining || spec.isolating) { break }
      if (targetDepths.indexOf(d) > -1) { preferredTarget = d; }
      else if ($from.before(d) == pos) { targetDepths.splice(1, 0, -d); }
    }
    // Try to fit each possible depth of the slice into each possible
    // target depth, starting with the preferred depths.
    var preferredTargetIndex = targetDepths.indexOf(preferredTarget);

    var leftNodes = [], preferredDepth = slice.openStart;
    for (var content = slice.content, i = 0;; i++) {
      var node = content.firstChild;
      leftNodes.push(node);
      if (i == slice.openStart) { break }
      content = node.content;
    }
    // Back up if the node directly above openStart, or the node above
    // that separated only by a non-defining textblock node, is defining.
    if (preferredDepth > 0 && leftNodes[preferredDepth - 1].type.spec.defining &&
        $from.node(preferredTargetIndex).type != leftNodes[preferredDepth - 1].type)
      { preferredDepth -= 1; }
    else if (preferredDepth >= 2 && leftNodes[preferredDepth - 1].isTextblock && leftNodes[preferredDepth - 2].type.spec.defining &&
             $from.node(preferredTargetIndex).type != leftNodes[preferredDepth - 2].type)
      { preferredDepth -= 2; }

    for (var j = slice.openStart; j >= 0; j--) {
      var openDepth = (j + preferredDepth + 1) % (slice.openStart + 1);
      var insert = leftNodes[openDepth];
      if (!insert) { continue }
      for (var i$1 = 0; i$1 < targetDepths.length; i$1++) {
        // Loop over possible expansion levels, starting with the
        // preferred one
        var targetDepth = targetDepths[(i$1 + preferredTargetIndex) % targetDepths.length], expand = true;
        if (targetDepth < 0) { expand = false; targetDepth = -targetDepth; }
        var parent = $from.node(targetDepth - 1), index = $from.index(targetDepth - 1);
        if (parent.canReplaceWith(index, index, insert.type, insert.marks))
          { return this$1.replace($from.before(targetDepth), expand ? $to.after(targetDepth) : to,
                              new dist.Slice(closeFragment(slice.content, 0, slice.openStart, openDepth),
                                        openDepth, slice.openEnd)) }
      }
    }

    return this.replace(from, to, slice)
  };

  function closeFragment(fragment, depth, oldOpen, newOpen, parent) {
    if (depth < oldOpen) {
      var first = fragment.firstChild;
      fragment = fragment.replaceChild(0, first.copy(closeFragment(first.content, depth + 1, oldOpen, newOpen, first)));
    }
    if (depth > newOpen)
      { fragment = parent.contentMatchAt(0).fillBefore(fragment, true).append(fragment); }
    return fragment
  }

  // :: (number, number, Node) → this
  // Replace the given range with a node, but use `from` and `to` as
  // hints, rather than precise positions. When from and to are the same
  // and are at the start or end of a parent node in which the given
  // node doesn't fit, this method may _move_ them out towards a parent
  // that does allow the given node to be placed. When the given range
  // completely covers a parent node, this method may completely replace
  // that parent node.
  Transform.prototype.replaceRangeWith = function(from, to, node) {
    if (!node.isInline && from == to && this.doc.resolve(from).parent.content.size) {
      var point = insertPoint(this.doc, from, node.type);
      if (point != null) { from = to = point; }
    }
    return this.replaceRange(from, to, new dist.Slice(dist.Fragment.from(node), 0, 0))
  };

  // :: (number, number) → this
  // Delete the given range, expanding it to cover fully covered
  // parent nodes until a valid replace is found.
  Transform.prototype.deleteRange = function(from, to) {
    var this$1 = this;

    var $from = this.doc.resolve(from), $to = this.doc.resolve(to);
    var covered = coveredDepths($from, $to);
    for (var i = 0; i < covered.length; i++) {
      var depth = covered[i], last = i == covered.length - 1;
      if ((last && depth == 0) || $from.node(depth).type.contentMatch.validEnd)
        { return this$1.delete($from.start(depth), $to.end(depth)) }
      if (depth > 0 && (last || $from.node(depth - 1).canReplace($from.index(depth - 1), $to.indexAfter(depth - 1))))
        { return this$1.delete($from.before(depth), $to.after(depth)) }
    }
    for (var d = 1; d <= $from.depth; d++) {
      if (from - $from.start(d) == $from.depth - d && to > $from.end(d))
        { return this$1.delete($from.before(d), to) }
    }
    return this.delete(from, to)
  };

  // : (ResolvedPos, ResolvedPos) → [number]
  // Returns an array of all depths for which $from - $to spans the
  // whole content of the nodes at that depth.
  function coveredDepths($from, $to) {
    var result = [], minDepth = Math.min($from.depth, $to.depth);
    for (var d = minDepth; d >= 0; d--) {
      var start = $from.start(d);
      if (start < $from.pos - ($from.depth - d) ||
          $to.end(d) > $to.pos + ($to.depth - d) ||
          $from.node(d).type.spec.isolating ||
          $to.node(d).type.spec.isolating) { break }
      if (start == $to.start(d)) { result.push(d); }
    }
    return result
  }

  exports.Transform = Transform;
  exports.TransformError = TransformError;
  exports.Step = Step;
  exports.StepResult = StepResult;
  exports.joinPoint = joinPoint;
  exports.canJoin = canJoin;
  exports.canSplit = canSplit;
  exports.insertPoint = insertPoint;
  exports.dropPoint = dropPoint;
  exports.liftTarget = liftTarget;
  exports.findWrapping = findWrapping;
  exports.StepMap = StepMap;
  exports.MapResult = MapResult;
  exports.Mapping = Mapping;
  exports.AddMarkStep = AddMarkStep;
  exports.RemoveMarkStep = RemoveMarkStep;
  exports.ReplaceStep = ReplaceStep;
  exports.ReplaceAroundStep = ReplaceAroundStep;
  exports.replaceStep = replaceStep;

  });

  var index = unwrapExports(dist$1);
  var dist_1$1 = dist$1.Transform;
  var dist_2$1 = dist$1.TransformError;
  var dist_3$1 = dist$1.Step;
  var dist_4$1 = dist$1.StepResult;
  var dist_5$1 = dist$1.joinPoint;
  var dist_6$1 = dist$1.canJoin;
  var dist_7$1 = dist$1.canSplit;
  var dist_8$1 = dist$1.insertPoint;
  var dist_9$1 = dist$1.dropPoint;
  var dist_10$1 = dist$1.liftTarget;
  var dist_11$1 = dist$1.findWrapping;
  var dist_12$1 = dist$1.StepMap;
  var dist_13$1 = dist$1.MapResult;
  var dist_14 = dist$1.Mapping;
  var dist_15 = dist$1.AddMarkStep;
  var dist_16 = dist$1.RemoveMarkStep;
  var dist_17 = dist$1.ReplaceStep;
  var dist_18 = dist$1.ReplaceAroundStep;
  var dist_19 = dist$1.replaceStep;

  var dist$2 = /*#__PURE__*/Object.freeze({
    'default': index,
    __moduleExports: dist$1,
    Transform: dist_1$1,
    TransformError: dist_2$1,
    Step: dist_3$1,
    StepResult: dist_4$1,
    joinPoint: dist_5$1,
    canJoin: dist_6$1,
    canSplit: dist_7$1,
    insertPoint: dist_8$1,
    dropPoint: dist_9$1,
    liftTarget: dist_10$1,
    findWrapping: dist_11$1,
    StepMap: dist_12$1,
    MapResult: dist_13$1,
    Mapping: dist_14,
    AddMarkStep: dist_15,
    RemoveMarkStep: dist_16,
    ReplaceStep: dist_17,
    ReplaceAroundStep: dist_18,
    replaceStep: dist_19
  });

  var prosemirrorTransform = ( dist$2 && index ) || dist$2;

  var dist$3 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, '__esModule', { value: true });




  var classesById = Object.create(null);

  // ::- Superclass for editor selections. Every selection type should
  // extend this. Should not be instantiated directly.
  var Selection = function Selection($anchor, $head, ranges) {
    // :: [SelectionRange]
    // The ranges covered by the selection.
    this.ranges = ranges || [new SelectionRange($anchor.min($head), $anchor.max($head))];
    // :: ResolvedPos
    // The resolved anchor of the selection (the side that stays in
    // place when the selection is modified).
    this.$anchor = $anchor;
    // :: ResolvedPos
    // The resolved head of the selection (the side that moves when
    // the selection is modified).
    this.$head = $head;
  };

  var prototypeAccessors = { anchor: {},head: {},from: {},to: {},$from: {},$to: {},empty: {} };

  // :: number
  // The selection's anchor, as an unresolved position.
  prototypeAccessors.anchor.get = function () { return this.$anchor.pos };

  // :: number
  // The selection's head.
  prototypeAccessors.head.get = function () { return this.$head.pos };

  // :: number
  // The lower bound of the selection's main range.
  prototypeAccessors.from.get = function () { return this.$from.pos };

  // :: number
  // The upper bound of the selection's main range.
  prototypeAccessors.to.get = function () { return this.$to.pos };

  // :: ResolvedPos
  // The resolved lowerbound of the selection's main range.
  prototypeAccessors.$from.get = function () {
    return this.ranges[0].$from
  };

  // :: ResolvedPos
  // The resolved upper bound of the selection's main range.
  prototypeAccessors.$to.get = function () {
    return this.ranges[0].$to
  };

  // :: bool
  // Indicates whether the selection contains any content.
  prototypeAccessors.empty.get = function () {
    var ranges = this.ranges;
    for (var i = 0; i < ranges.length; i++)
      { if (ranges[i].$from.pos != ranges[i].$to.pos) { return false } }
    return true
  };

  // eq:: (Selection) → bool
  // Test whether the selection is the same as another selection.

  // map:: (doc: Node, mapping: Mappable) → Selection
  // Map this selection through a [mappable](#transform.Mappable) thing. `doc`
  // should be the new document to which we are mapping.

  // :: () → Slice
  // Get the content of this selection as a slice.
  Selection.prototype.content = function content () {
    return this.$from.node(0).slice(this.from, this.to, true)
  };

  // :: (Transaction, ?Slice)
  // Replace the selection with a slice or, if no slice is given,
  // delete the selection. Will append to the given transaction.
  Selection.prototype.replace = function replace (tr, content) {
      if ( content === void 0 ) content = dist.Slice.empty;

    // Put the new selection at the position after the inserted
    // content. When that ended in an inline node, search backwards,
    // to get the position after that node. If not, search forward.
    var lastNode = content.content.lastChild, lastParent = null;
    for (var i = 0; i < content.openEnd; i++) {
      lastParent = lastNode;
      lastNode = lastNode.lastChild;
    }

    var mapFrom = tr.steps.length, ranges = this.ranges;
    for (var i$1 = 0; i$1 < ranges.length; i$1++) {
      var ref = ranges[i$1];
        var $from = ref.$from;
        var $to = ref.$to;
        var mapping = tr.mapping.slice(mapFrom);
      tr.replaceRange(mapping.map($from.pos), mapping.map($to.pos), i$1 ? dist.Slice.empty : content);
      if (i$1 == 0)
        { selectionToInsertionEnd(tr, mapFrom, (lastNode ? lastNode.isInline : lastParent && lastParent.isTextblock) ? -1 : 1); }
    }
  };

  // :: (Transaction, Node)
  // Replace the selection with the given node, appending the changes
  // to the given transaction.
  Selection.prototype.replaceWith = function replaceWith (tr, node) {
    var mapFrom = tr.steps.length, ranges = this.ranges;
    for (var i = 0; i < ranges.length; i++) {
      var ref = ranges[i];
        var $from = ref.$from;
        var $to = ref.$to;
        var mapping = tr.mapping.slice(mapFrom);
      var from = mapping.map($from.pos), to = mapping.map($to.pos);
      if (i) {
        tr.deleteRange(from, to);
      } else {
        tr.replaceRangeWith(from, to, node);
        selectionToInsertionEnd(tr, mapFrom, node.isInline ? -1 : 1);
      }
    }
  };

  // toJSON:: () → Object
  // Convert the selection to a JSON representation. When implementing
  // this for a custom selection class, make sure to give the object a
  // `type` property whose value matches the ID under which you
  // [registered](#state.Selection^jsonID) your class.

  // :: (ResolvedPos, number, ?bool) → ?Selection
  // Find a valid cursor or leaf node selection starting at the given
  // position and searching back if `dir` is negative, and forward if
  // positive. When `textOnly` is true, only consider cursor
  // selections. Will return null when no valid selection position is
  // found.
  Selection.findFrom = function findFrom ($pos, dir, textOnly) {
    var inner = $pos.parent.inlineContent ? new TextSelection($pos)
        : findSelectionIn($pos.node(0), $pos.parent, $pos.pos, $pos.index(), dir, textOnly);
    if (inner) { return inner }

    for (var depth = $pos.depth - 1; depth >= 0; depth--) {
      var found = dir < 0
          ? findSelectionIn($pos.node(0), $pos.node(depth), $pos.before(depth + 1), $pos.index(depth), dir, textOnly)
          : findSelectionIn($pos.node(0), $pos.node(depth), $pos.after(depth + 1), $pos.index(depth) + 1, dir, textOnly);
      if (found) { return found }
    }
  };

  // :: (ResolvedPos, ?number) → Selection
  // Find a valid cursor or leaf node selection near the given
  // position. Searches forward first by default, but if `bias` is
  // negative, it will search backwards first.
  Selection.near = function near ($pos, bias) {
      if ( bias === void 0 ) bias = 1;

    return this.findFrom($pos, bias) || this.findFrom($pos, -bias) || new AllSelection($pos.node(0))
  };

  // :: (Node) → Selection
  // Find the cursor or leaf node selection closest to the start of
  // the given document. Will return an
  // [`AllSelection`](#state.AllSelection) if no valid position
  // exists.
  Selection.atStart = function atStart (doc) {
    return findSelectionIn(doc, doc, 0, 0, 1) || new AllSelection(doc)
  };

  // :: (Node) → Selection
  // Find the cursor or leaf node selection closest to the end of the
  // given document.
  Selection.atEnd = function atEnd (doc) {
    return findSelectionIn(doc, doc, doc.content.size, doc.childCount, -1) || new AllSelection(doc)
  };

  // :: (Node, Object) → Selection
  // Deserialize the JSON representation of a selection. Must be
  // implemented for custom classes (as a static class method).
  Selection.fromJSON = function fromJSON (doc, json) {
    if (!json || !json.type) { throw new RangeError("Invalid input for Selection.fromJSON") }
    var cls = classesById[json.type];
    if (!cls) { throw new RangeError(("No selection type " + (json.type) + " defined")) }
    return cls.fromJSON(doc, json)
  };

  // :: (string, constructor<Selection>)
  // To be able to deserialize selections from JSON, custom selection
  // classes must register themselves with an ID string, so that they
  // can be disambiguated. Try to pick something that's unlikely to
  // clash with classes from other modules.
  Selection.jsonID = function jsonID (id, selectionClass) {
    if (id in classesById) { throw new RangeError("Duplicate use of selection JSON ID " + id) }
    classesById[id] = selectionClass;
    selectionClass.prototype.jsonID = id;
    return selectionClass
  };

  // :: () → SelectionBookmark
  // Get a [bookmark](#state.SelectionBookmark) for this selection,
  // which is a value that can be mapped without having access to a
  // current document, and later resolved to a real selection for a
  // given document again. (This is used mostly by the history to
  // track and restore old selections.) The default implementation of
  // this method just converts the selection to a text selection and
  // returns the bookmark for that.
  Selection.prototype.getBookmark = function getBookmark () {
    return TextSelection.between(this.$anchor, this.$head).getBookmark()
  };

  Object.defineProperties( Selection.prototype, prototypeAccessors );

  // :: bool
  // Controls whether, when a selection of this type is active in the
  // browser, the selected range should be visible to the user. Defaults
  // to `true`.
  Selection.prototype.visible = true;

  // SelectionBookmark:: interface
  // A lightweight, document-independent representation of a selection.
  // You can define a custom bookmark type for a custom selection class
  // to make the history handle it well.
  //
  //   map:: (mapping: Mapping) → SelectionBookmark
  //   Map the bookmark through a set of changes.
  //
  //   resolve:: (doc: Node) → Selection
  //   Resolve the bookmark to a real selection again. This may need to
  //   do some error checking and may fall back to a default (usually
  //   [`TextSelection.between`](#state.TextSelection^between)) if
  //   mapping made the bookmark invalid.

  // ::- Represents a selected range in a document.
  var SelectionRange = function SelectionRange($from, $to) {
    // :: ResolvedPos
    // The lower bound of the range.
    this.$from = $from;
    // :: ResolvedPos
    // The upper bound of the range.
    this.$to = $to;
  };

  // ::- A text selection represents a classical editor selection, with
  // a head (the moving side) and anchor (immobile side), both of which
  // point into textblock nodes. It can be empty (a regular cursor
  // position).
  var TextSelection = (function (Selection) {
    function TextSelection($anchor, $head) {
      if ( $head === void 0 ) $head = $anchor;

      Selection.call(this, $anchor, $head);
    }

    if ( Selection ) TextSelection.__proto__ = Selection;
    TextSelection.prototype = Object.create( Selection && Selection.prototype );
    TextSelection.prototype.constructor = TextSelection;

    var prototypeAccessors$1 = { $cursor: {} };

    // :: ?ResolvedPos
    // Returns a resolved position if this is a cursor selection (an
    // empty text selection), and null otherwise.
    prototypeAccessors$1.$cursor.get = function () { return this.$anchor.pos == this.$head.pos ? this.$head : null };

    TextSelection.prototype.map = function map (doc, mapping) {
      var $head = doc.resolve(mapping.map(this.head));
      if (!$head.parent.inlineContent) { return Selection.near($head) }
      var $anchor = doc.resolve(mapping.map(this.anchor));
      return new TextSelection($anchor.parent.inlineContent ? $anchor : $head, $head)
    };

    TextSelection.prototype.replace = function replace (tr, content) {
      if ( content === void 0 ) content = dist.Slice.empty;

      Selection.prototype.replace.call(this, tr, content);
      if (content == dist.Slice.empty) {
        var marks = this.$from.marksAcross(this.$to);
        if (marks) { tr.ensureMarks(marks); }
      }
    };

    TextSelection.prototype.eq = function eq (other) {
      return other instanceof TextSelection && other.anchor == this.anchor && other.head == this.head
    };

    TextSelection.prototype.getBookmark = function getBookmark () {
      return new TextBookmark(this.anchor, this.head)
    };

    TextSelection.prototype.toJSON = function toJSON () {
      return {type: "text", anchor: this.anchor, head: this.head}
    };

    TextSelection.fromJSON = function fromJSON (doc, json) {
      if (typeof json.anchor != "number" || typeof json.head != "number")
        { throw new RangeError("Invalid input for TextSelection.fromJSON") }
      return new TextSelection(doc.resolve(json.anchor), doc.resolve(json.head))
    };

    // :: (Node, number, ?number) → TextSelection
    // Create a text selection from non-resolved positions.
    TextSelection.create = function create (doc, anchor, head) {
      if ( head === void 0 ) head = anchor;

      var $anchor = doc.resolve(anchor);
      return new this($anchor, head == anchor ? $anchor : doc.resolve(head))
    };

    // :: (ResolvedPos, ResolvedPos, ?number) → Selection
    // Return a text selection that spans the given positions or, if
    // they aren't text positions, find a text selection near them.
    // `bias` determines whether the method searches forward (default)
    // or backwards (negative number) first. Will fall back to calling
    // [`Selection.near`](#state.Selection^near) when the document
    // doesn't contain a valid text position.
    TextSelection.between = function between ($anchor, $head, bias) {
      var dPos = $anchor.pos - $head.pos;
      if (!bias || dPos) { bias = dPos >= 0 ? 1 : -1; }
      if (!$head.parent.inlineContent) {
        var found = Selection.findFrom($head, bias, true) || Selection.findFrom($head, -bias, true);
        if (found) { $head = found.$head; }
        else { return Selection.near($head, bias) }
      }
      if (!$anchor.parent.inlineContent) {
        if (dPos == 0) {
          $anchor = $head;
        } else {
          $anchor = (Selection.findFrom($anchor, -bias, true) || Selection.findFrom($anchor, bias, true)).$anchor;
          if (($anchor.pos < $head.pos) != (dPos < 0)) { $anchor = $head; }
        }
      }
      return new TextSelection($anchor, $head)
    };

    Object.defineProperties( TextSelection.prototype, prototypeAccessors$1 );

    return TextSelection;
  }(Selection));

  Selection.jsonID("text", TextSelection);

  var TextBookmark = function TextBookmark(anchor, head) {
    this.anchor = anchor;
    this.head = head;
  };
  TextBookmark.prototype.map = function map (mapping) {
    return new TextBookmark(mapping.map(this.anchor), mapping.map(this.head))
  };
  TextBookmark.prototype.resolve = function resolve (doc) {
    return TextSelection.between(doc.resolve(this.anchor), doc.resolve(this.head))
  };

  // ::- A node selection is a selection that points at a single node.
  // All nodes marked [selectable](#model.NodeSpec.selectable) can be
  // the target of a node selection. In such a selection, `from` and
  // `to` point directly before and after the selected node, `anchor`
  // equals `from`, and `head` equals `to`..
  var NodeSelection = (function (Selection) {
    function NodeSelection($pos) {
      var node = $pos.nodeAfter;
      var $end = $pos.node(0).resolve($pos.pos + node.nodeSize);
      Selection.call(this, $pos, $end);
      // :: Node The selected node.
      this.node = node;
    }

    if ( Selection ) NodeSelection.__proto__ = Selection;
    NodeSelection.prototype = Object.create( Selection && Selection.prototype );
    NodeSelection.prototype.constructor = NodeSelection;

    NodeSelection.prototype.map = function map (doc, mapping) {
      var ref = mapping.mapResult(this.anchor);
      var deleted = ref.deleted;
      var pos = ref.pos;
      var $pos = doc.resolve(pos);
      if (deleted) { return Selection.near($pos) }
      return new NodeSelection($pos)
    };

    NodeSelection.prototype.content = function content () {
      return new dist.Slice(dist.Fragment.from(this.node), 0, 0)
    };

    NodeSelection.prototype.eq = function eq (other) {
      return other instanceof NodeSelection && other.anchor == this.anchor
    };

    NodeSelection.prototype.toJSON = function toJSON () {
      return {type: "node", anchor: this.anchor}
    };

    NodeSelection.prototype.getBookmark = function getBookmark () { return new NodeBookmark(this.anchor) };

    NodeSelection.fromJSON = function fromJSON (doc, json) {
      if (typeof json.anchor != "number")
        { throw new RangeError("Invalid input for NodeSelection.fromJSON") }
      return new NodeSelection(doc.resolve(json.anchor))
    };

    // :: (Node, number) → NodeSelection
    // Create a node selection from non-resolved positions.
    NodeSelection.create = function create (doc, from) {
      return new this(doc.resolve(from))
    };

    // :: (Node) → bool
    // Determines whether the given node may be selected as a node
    // selection.
    NodeSelection.isSelectable = function isSelectable (node) {
      return !node.isText && node.type.spec.selectable !== false
    };

    return NodeSelection;
  }(Selection));

  NodeSelection.prototype.visible = false;

  Selection.jsonID("node", NodeSelection);

  var NodeBookmark = function NodeBookmark(anchor) {
    this.anchor = anchor;
  };
  NodeBookmark.prototype.map = function map (mapping) {
    var ref = mapping.mapResult(this.anchor);
      var deleted = ref.deleted;
      var pos = ref.pos;
    return deleted ? new TextBookmark(pos, pos) : new NodeBookmark(pos)
  };
  NodeBookmark.prototype.resolve = function resolve (doc) {
    var $pos = doc.resolve(this.anchor), node = $pos.nodeAfter;
    if (node && NodeSelection.isSelectable(node)) { return new NodeSelection($pos) }
    return Selection.near($pos)
  };

  // ::- A selection type that represents selecting the whole document
  // (which can not necessarily be expressed with a text selection, when
  // there are for example leaf block nodes at the start or end of the
  // document).
  var AllSelection = (function (Selection) {
    function AllSelection(doc) {
      Selection.call(this, doc.resolve(0), doc.resolve(doc.content.size));
    }

    if ( Selection ) AllSelection.__proto__ = Selection;
    AllSelection.prototype = Object.create( Selection && Selection.prototype );
    AllSelection.prototype.constructor = AllSelection;

    AllSelection.prototype.toJSON = function toJSON () { return {type: "all"} };

    AllSelection.fromJSON = function fromJSON (doc) { return new AllSelection(doc) };

    AllSelection.prototype.map = function map (doc) { return new AllSelection(doc) };

    AllSelection.prototype.eq = function eq (other) { return other instanceof AllSelection };

    AllSelection.prototype.getBookmark = function getBookmark () { return AllBookmark };

    return AllSelection;
  }(Selection));

  Selection.jsonID("all", AllSelection);

  var AllBookmark = {
    map: function map() { return this },
    resolve: function resolve(doc) { return new AllSelection(doc) }
  };

  // FIXME we'll need some awareness of text direction when scanning for selections

  // Try to find a selection inside the given node. `pos` points at the
  // position where the search starts. When `text` is true, only return
  // text selections.
  function findSelectionIn(doc, node, pos, index, dir, text) {
    if (node.inlineContent) { return TextSelection.create(doc, pos) }
    for (var i = index - (dir > 0 ? 0 : 1); dir > 0 ? i < node.childCount : i >= 0; i += dir) {
      var child = node.child(i);
      if (!child.isAtom) {
        var inner = findSelectionIn(doc, child, pos + dir, dir < 0 ? child.childCount : 0, dir, text);
        if (inner) { return inner }
      } else if (!text && NodeSelection.isSelectable(child)) {
        return NodeSelection.create(doc, pos - (dir < 0 ? child.nodeSize : 0))
      }
      pos += child.nodeSize * dir;
    }
  }

  function selectionToInsertionEnd(tr, startLen, bias) {
    var last = tr.steps.length - 1;
    if (last < startLen) { return }
    var step = tr.steps[last];
    if (!(step instanceof prosemirrorTransform.ReplaceStep || step instanceof prosemirrorTransform.ReplaceAroundStep)) { return }
    var map = tr.mapping.maps[last], end;
    map.forEach(function (_from, _to, _newFrom, newTo) { if (end == null) { end = newTo; } });
    tr.setSelection(Selection.near(tr.doc.resolve(end), bias));
  }

  var UPDATED_SEL = 1;
  var UPDATED_MARKS = 2;
  var UPDATED_SCROLL = 4;

  // ::- An editor state transaction, which can be applied to a state to
  // create an updated state. Use
  // [`EditorState.tr`](#state.EditorState.tr) to create an instance.
  //
  // Transactions track changes to the document (they are a subclass of
  // [`Transform`](#transform.Transform)), but also other state changes,
  // like selection updates and adjustments of the set of [stored
  // marks](#state.EditorState.storedMarks). In addition, you can store
  // metadata properties in a transaction, which are extra pieces of
  // information that client code or plugins can use to describe what a
  // transacion represents, so that they can update their [own
  // state](#state.StateField) accordingly.
  //
  // The [editor view](#view.EditorView) uses a few metadata properties:
  // it will attach a property `"pointer"` with the value `true` to
  // selection transactions directly caused by mouse or touch input, and
  // a `"uiEvent"` property of that may be `"paste"`, `"cut"`, or `"drop"`.
  var Transaction = (function (Transform$$1) {
    function Transaction(state) {
      Transform$$1.call(this, state.doc);
      // :: number
      // The timestamp associated with this transaction, in the same
      // format as `Date.now()`.
      this.time = Date.now();
      this.curSelection = state.selection;
      // The step count for which the current selection is valid.
      this.curSelectionFor = 0;
      // :: ?[Mark]
      // The stored marks set by this transaction, if any.
      this.storedMarks = state.storedMarks;
      // Bitfield to track which aspects of the state were updated by
      // this transaction.
      this.updated = 0;
      // Object used to store metadata properties for the transaction.
      this.meta = Object.create(null);
    }

    if ( Transform$$1 ) Transaction.__proto__ = Transform$$1;
    Transaction.prototype = Object.create( Transform$$1 && Transform$$1.prototype );
    Transaction.prototype.constructor = Transaction;

    var prototypeAccessors = { selection: {},selectionSet: {},storedMarksSet: {},isGeneric: {},scrolledIntoView: {} };

    // :: Selection
    // The transaction's current selection. This defaults to the editor
    // selection [mapped](#state.Selection.map) through the steps in the
    // transaction, but can be overwritten with
    // [`setSelection`](#state.Transaction.setSelection).
    prototypeAccessors.selection.get = function () {
      if (this.curSelectionFor < this.steps.length) {
        this.curSelection = this.curSelection.map(this.doc, this.mapping.slice(this.curSelectionFor));
        this.curSelectionFor = this.steps.length;
      }
      return this.curSelection
    };

    // :: (Selection) → Transaction
    // Update the transaction's current selection. Will determine the
    // selection that the editor gets when the transaction is applied.
    Transaction.prototype.setSelection = function setSelection (selection) {
      this.curSelection = selection;
      this.curSelectionFor = this.steps.length;
      this.updated = (this.updated | UPDATED_SEL) & ~UPDATED_MARKS;
      this.storedMarks = null;
      return this
    };

    // :: bool
    // Whether the selection was explicitly updated by this transaction.
    prototypeAccessors.selectionSet.get = function () {
      return (this.updated & UPDATED_SEL) > 0
    };

    // :: (?[Mark]) → Transaction
    // Set the current stored marks.
    Transaction.prototype.setStoredMarks = function setStoredMarks (marks) {
      this.storedMarks = marks;
      this.updated |= UPDATED_MARKS;
      return this
    };

    // :: ([Mark]) → Transaction
    // Make sure the current stored marks or, if that is null, the marks
    // at the selection, match the given set of marks. Does nothing if
    // this is already the case.
    Transaction.prototype.ensureMarks = function ensureMarks (marks) {
      if (!dist.Mark.sameSet(this.storedMarks || this.selection.$from.marks(), marks))
        { this.setStoredMarks(marks); }
      return this
    };

    // :: (Mark) → Transaction
    // Add a mark to the set of stored marks.
    Transaction.prototype.addStoredMark = function addStoredMark (mark) {
      return this.ensureMarks(mark.addToSet(this.storedMarks || this.selection.$head.marks()))
    };

    // :: (union<Mark, MarkType>) → Transaction
    // Remove a mark or mark type from the set of stored marks.
    Transaction.prototype.removeStoredMark = function removeStoredMark (mark) {
      return this.ensureMarks(mark.removeFromSet(this.storedMarks || this.selection.$head.marks()))
    };

    // :: bool
    // Whether the stored marks were explicitly set for this transaction.
    prototypeAccessors.storedMarksSet.get = function () {
      return (this.updated & UPDATED_MARKS) > 0
    };

    Transaction.prototype.addStep = function addStep (step, doc) {
      Transform$$1.prototype.addStep.call(this, step, doc);
      this.updated = this.updated & ~UPDATED_MARKS;
      this.storedMarks = null;
    };

    // :: (number) → Transaction
    // Update the timestamp for the transaction.
    Transaction.prototype.setTime = function setTime (time) {
      this.time = time;
      return this
    };

    // :: (Slice) → Transaction
    // Replace the current selection with the given slice.
    Transaction.prototype.replaceSelection = function replaceSelection (slice) {
      this.selection.replace(this, slice);
      return this
    };

    // :: (Node, ?bool) → Transaction
    // Replace the selection with the given node. When `inheritMarks` is
    // true and the content is inline, it inherits the marks from the
    // place where it is inserted.
    Transaction.prototype.replaceSelectionWith = function replaceSelectionWith (node, inheritMarks) {
      var selection = this.selection;
      if (inheritMarks !== false)
        { node = node.mark(this.storedMarks || (selection.empty ? selection.$from.marks() : (selection.$from.marksAcross(selection.$to) || dist.Mark.none))); }
      selection.replaceWith(this, node);
      return this
    };

    // :: () → Transaction
    // Delete the selection.
    Transaction.prototype.deleteSelection = function deleteSelection () {
      this.selection.replace(this);
      return this
    };

    // :: (string, from: ?number, to: ?number) → Transaction
    // Replace the given range, or the selection if no range is given,
    // with a text node containing the given string.
    Transaction.prototype.insertText = function insertText (text, from, to) {
      if ( to === void 0 ) to = from;

      var schema = this.doc.type.schema;
      if (from == null) {
        if (!text) { return this.deleteSelection() }
        return this.replaceSelectionWith(schema.text(text), true)
      } else {
        if (!text) { return this.deleteRange(from, to) }
        var marks = this.storedMarks;
        if (!marks) {
          var $from = this.doc.resolve(from);
          marks = to == from ? $from.marks() : $from.marksAcross(this.doc.resolve(to));
        }
        this.replaceRangeWith(from, to, schema.text(text, marks));
        if (!this.selection.empty) { this.setSelection(Selection.near(this.selection.$to)); }
        return this
      }
    };

    // :: (union<string, Plugin, PluginKey>, any) → Transaction
    // Store a metadata property in this transaction, keyed either by
    // name or by plugin.
    Transaction.prototype.setMeta = function setMeta (key, value) {
      this.meta[typeof key == "string" ? key : key.key] = value;
      return this
    };

    // :: (union<string, Plugin, PluginKey>) → any
    // Retrieve a metadata property for a given name or plugin.
    Transaction.prototype.getMeta = function getMeta (key) {
      return this.meta[typeof key == "string" ? key : key.key]
    };

    // :: bool
    // Returns true if this transaction doesn't contain any metadata,
    // and can thus safely be extended.
    prototypeAccessors.isGeneric.get = function () {
      var this$1 = this;

      for (var _ in this$1.meta) { return false }
      return true
    };

    // :: () → Transaction
    // Indicate that the editor should scroll the selection into view
    // when updated to the state produced by this transaction.
    Transaction.prototype.scrollIntoView = function scrollIntoView () {
      this.updated |= UPDATED_SCROLL;
      return this
    };

    prototypeAccessors.scrolledIntoView.get = function () {
      return (this.updated & UPDATED_SCROLL) > 0
    };

    Object.defineProperties( Transaction.prototype, prototypeAccessors );

    return Transaction;
  }(prosemirrorTransform.Transform));

  function bind(f, self) {
    return !self || !f ? f : f.bind(self)
  }

  var FieldDesc = function FieldDesc(name, desc, self) {
    this.name = name;
    this.init = bind(desc.init, self);
    this.apply = bind(desc.apply, self);
  };

  var baseFields = [
    new FieldDesc("doc", {
      init: function init(config) { return config.doc || config.schema.topNodeType.createAndFill() },
      apply: function apply(tr) { return tr.doc }
    }),

    new FieldDesc("selection", {
      init: function init(config, instance) { return config.selection || Selection.atStart(instance.doc) },
      apply: function apply(tr) { return tr.selection }
    }),

    new FieldDesc("storedMarks", {
      init: function init(config) { return config.storedMarks || null },
      apply: function apply(tr, _marks, _old, state) { return state.selection.$cursor ? tr.storedMarks : null }
    }),

    new FieldDesc("scrollToSelection", {
      init: function init() { return 0 },
      apply: function apply(tr, prev) { return tr.scrolledIntoView ? prev + 1 : prev }
    })
  ];

  // Object wrapping the part of a state object that stays the same
  // across transactions. Stored in the state's `config` property.
  var Configuration = function Configuration(schema, plugins) {
    var this$1 = this;

    this.schema = schema;
    this.fields = baseFields.concat();
    this.plugins = [];
    this.pluginsByKey = Object.create(null);
    if (plugins) { plugins.forEach(function (plugin) {
      if (this$1.pluginsByKey[plugin.key])
        { throw new RangeError("Adding different instances of a keyed plugin (" + plugin.key + ")") }
      this$1.plugins.push(plugin);
      this$1.pluginsByKey[plugin.key] = plugin;
      if (plugin.spec.state)
        { this$1.fields.push(new FieldDesc(plugin.key, plugin.spec.state, plugin)); }
    }); }
  };

  // ::- The state of a ProseMirror editor is represented by an object
  // of this type. A state is a persistent data structure—it isn't
  // updated, but rather a new state value is computed from an old one
  // using the [`apply`](#state.EditorState.apply) method.
  //
  // A state holds a number of built-in fields, and plugins can
  // [define](#state.PluginSpec.state) additional fields.
  var EditorState = function EditorState(config) {
    this.config = config;
  };

  var prototypeAccessors$1 = { schema: {},plugins: {},tr: {} };

  // doc:: Node
  // The current document.

  // selection:: Selection
  // The selection.

  // storedMarks:: ?[Mark]
  // A set of marks to apply to the next input. Will be null when
  // no explicit marks have been set.

  // :: Schema
  // The schema of the state's document.
  prototypeAccessors$1.schema.get = function () {
    return this.config.schema
  };

  // :: [Plugin]
  // The plugins that are active in this state.
  prototypeAccessors$1.plugins.get = function () {
    return this.config.plugins
  };

  // :: (Transaction) → EditorState
  // Apply the given transaction to produce a new state.
  EditorState.prototype.apply = function apply (tr) {
    return this.applyTransaction(tr).state
  };

  // : (Transaction) → bool
  EditorState.prototype.filterTransaction = function filterTransaction (tr, ignore) {
      var this$1 = this;
      if ( ignore === void 0 ) ignore = -1;

    for (var i = 0; i < this.config.plugins.length; i++) { if (i != ignore) {
      var plugin = this$1.config.plugins[i];
      if (plugin.spec.filterTransaction && !plugin.spec.filterTransaction.call(plugin, tr, this$1))
        { return false }
    } }
    return true
  };

  // :: (Transaction) → {state: EditorState, transactions: [Transaction]}
  // Verbose variant of [`apply`](#state.EditorState.apply) that
  // returns the precise transactions that were applied (which might
  // be influenced by the [transaction
  // hooks](#state.PluginSpec.filterTransaction) of
  // plugins) along with the new state.
  EditorState.prototype.applyTransaction = function applyTransaction (rootTr) {
      var this$1 = this;

    if (!this.filterTransaction(rootTr)) { return {state: this, transactions: []} }

    var trs = [rootTr], newState = this.applyInner(rootTr), seen = null;
    // This loop repeatedly gives plugins a chance to respond to
    // transactions as new transactions are added, making sure to only
    // pass the transactions the plugin did not see before.
    outer: for (;;) {
      var haveNew = false;
      for (var i = 0; i < this.config.plugins.length; i++) {
        var plugin = this$1.config.plugins[i];
        if (plugin.spec.appendTransaction) {
          var n = seen ? seen[i].n : 0, oldState = seen ? seen[i].state : this$1;
          var tr = n < trs.length &&
              plugin.spec.appendTransaction.call(plugin, n ? trs.slice(n) : trs, oldState, newState);
          if (tr && newState.filterTransaction(tr, i)) {
            tr.setMeta("appendedTransaction", rootTr);
            if (!seen) {
              seen = [];
              for (var j = 0; j < this.config.plugins.length; j++)
                { seen.push(j < i ? {state: newState, n: trs.length} : {state: this$1, n: 0}); }
            }
            trs.push(tr);
            newState = newState.applyInner(tr);
            haveNew = true;
          }
          if (seen) { seen[i] = {state: newState, n: trs.length}; }
        }
      }
      if (!haveNew) { return {state: newState, transactions: trs} }
    }
  };

  // : (Transaction) → EditorState
  EditorState.prototype.applyInner = function applyInner (tr) {
      var this$1 = this;

    if (!tr.before.eq(this.doc)) { throw new RangeError("Applying a mismatched transaction") }
    var newInstance = new EditorState(this.config), fields = this.config.fields;
    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      newInstance[field.name] = field.apply(tr, this$1[field.name], this$1, newInstance);
    }
    for (var i$1 = 0; i$1 < applyListeners.length; i$1++) { applyListeners[i$1](this$1, tr, newInstance); }
    return newInstance
  };

  // :: Transaction
  // Start a [transaction](#state.Transaction) from this state.
  prototypeAccessors$1.tr.get = function () { return new Transaction(this) };

  // :: (Object) → EditorState
  // Create a new state.
  //
  // config::- Configuration options. Must contain `schema` or `doc` (or both).
  //
  //    schema:: ?Schema
  //    The schema to use.
  //
  //    doc:: ?Node
  //    The starting document.
  //
  //    selection:: ?Selection
  //    A valid selection in the document.
  //
  //    storedMarks:: ?[Mark]
  //    The initial set of [stored marks](#state.EditorState.storedMarks).
  //
  //    plugins:: ?[Plugin]
  //    The plugins that should be active in this state.
  EditorState.create = function create (config) {
    var $config = new Configuration(config.schema || config.doc.type.schema, config.plugins);
    var instance = new EditorState($config);
    for (var i = 0; i < $config.fields.length; i++)
      { instance[$config.fields[i].name] = $config.fields[i].init(config, instance); }
    return instance
  };

  // :: (Object) → EditorState
  // Create a new state based on this one, but with an adjusted set of
  // active plugins. State fields that exist in both sets of plugins
  // are kept unchanged. Those that no longer exist are dropped, and
  // those that are new are initialized using their
  // [`init`](#state.StateField.init) method, passing in the new
  // configuration object..
  //
  // config::- configuration options
  //
  //   schema:: ?Schema
  //   New schema to use.
  //
  //   plugins:: ?[Plugin]
  //   New set of active plugins.
  EditorState.prototype.reconfigure = function reconfigure (config) {
      var this$1 = this;

    var $config = new Configuration(config.schema || this.schema, config.plugins);
    var fields = $config.fields, instance = new EditorState($config);
    for (var i = 0; i < fields.length; i++) {
      var name = fields[i].name;
      instance[name] = this$1.hasOwnProperty(name) ? this$1[name] : fields[i].init(config, instance);
    }
    return instance
  };

  // :: (?union<Object<Plugin>, string, number>) → Object
  // Serialize this state to JSON. If you want to serialize the state
  // of plugins, pass an object mapping property names to use in the
  // resulting JSON object to plugin objects. The argument may also be
  // a string or number, in which case it is ignored, to support the
  // way `JSON.stringify` calls `toString` methods.
  EditorState.prototype.toJSON = function toJSON (pluginFields) {
      var this$1 = this;

    var result = {doc: this.doc.toJSON(), selection: this.selection.toJSON()};
    if (this.storedMarks) { result.storedMarks = this.storedMarks.map(function (m) { return m.toJSON(); }); }
    if (pluginFields && typeof pluginFields == 'object') { for (var prop in pluginFields) {
      if (prop == "doc" || prop == "selection")
        { throw new RangeError("The JSON fields `doc` and `selection` are reserved") }
      var plugin = pluginFields[prop], state = plugin.spec.state;
      if (state && state.toJSON) { result[prop] = state.toJSON.call(plugin, this$1[plugin.key]); }
    } }
    return result
  };

  // :: (Object, Object, ?Object<Plugin>) → EditorState
  // Deserialize a JSON representation of a state. `config` should
  // have at least a `schema` field, and should contain array of
  // plugins to initialize the state with. `pluginFields` can be used
  // to deserialize the state of plugins, by associating plugin
  // instances with the property names they use in the JSON object.
  //
  // config::- configuration options
  //
  //   schema:: Schema
  //   The schema to use.
  //
  //   plugins:: ?[Plugin]
  //   The set of active plugins.
  EditorState.fromJSON = function fromJSON (config, json, pluginFields) {
    if (!json) { throw new RangeError("Invalid input for EditorState.fromJSON") }
    if (!config.schema) { throw new RangeError("Required config field 'schema' missing") }
    var $config = new Configuration(config.schema, config.plugins);
    var instance = new EditorState($config);
    $config.fields.forEach(function (field) {
      if (field.name == "doc") {
        instance.doc = dist.Node.fromJSON(config.schema, json.doc);
      } else if (field.name == "selection") {
        instance.selection = Selection.fromJSON(instance.doc, json.selection);
      } else if (field.name == "storedMarks") {
        if (json.storedMarks) { instance.storedMarks = json.storedMarks.map(config.schema.markFromJSON); }
      } else {
        if (pluginFields) { for (var prop in pluginFields) {
          var plugin = pluginFields[prop], state = plugin.spec.state;
          if (plugin.key == field.name && state && state.fromJSON &&
              Object.prototype.hasOwnProperty.call(json, prop)) {
            // This field belongs to a plugin mapped to a JSON field, read it from there.
            instance[field.name] = state.fromJSON.call(plugin, config, json[prop], instance);
            return
          }
        } }
        instance[field.name] = field.init(config, instance);
      }
    });
    return instance
  };

  // Kludge to allow the view to track mappings between different
  // instances of a state.
  //
  // FIXME this is no longer needed as of prosemirror-view 1.9.0,
  // though due to backwards-compat we should probably keep it around
  // for a while (if only as a no-op)
  EditorState.addApplyListener = function addApplyListener (f) {
    applyListeners.push(f);
  };
  EditorState.removeApplyListener = function removeApplyListener (f) {
    var found = applyListeners.indexOf(f);
    if (found > -1) { applyListeners.splice(found, 1); }
  };

  Object.defineProperties( EditorState.prototype, prototypeAccessors$1 );

  var applyListeners = [];

  // PluginSpec:: interface
  //
  // This is the type passed to the [`Plugin`](#state.Plugin)
  // constructor. It provides a definition for a plugin.
  //
  //   props:: ?EditorProps
  //   The [view props](#view.EditorProps) added by this plugin. Props
  //   that are functions will be bound to have the plugin instance as
  //   their `this` binding.
  //
  //   state:: ?StateField<any>
  //   Allows a plugin to define a [state field](#state.StateField), an
  //   extra slot in the state object in which it can keep its own data.
  //
  //   key:: ?PluginKey
  //   Can be used to make this a keyed plugin. You can have only one
  //   plugin with a given key in a given state, but it is possible to
  //   access the plugin's configuration and state through the key,
  //   without having access to the plugin instance object.
  //
  //   view:: ?(EditorView) → Object
  //   When the plugin needs to interact with the editor view, or
  //   set something up in the DOM, use this field. The function
  //   will be called when the plugin's state is associated with an
  //   editor view.
  //
  //     return::-
  //     Should return an object with the following optional
  //     properties:
  //
  //       update:: ?(view: EditorView, prevState: EditorState)
  //       Called whenever the view's state is updated.
  //
  //       destroy:: ?()
  //       Called when the view is destroyed or receives a state
  //       with different plugins.
  //
  //   filterTransaction:: ?(Transaction, EditorState) → bool
  //   When present, this will be called before a transaction is
  //   applied by the state, allowing the plugin to cancel it (by
  //   returning false).
  //
  //   appendTransaction:: ?(transactions: [Transaction], oldState: EditorState, newState: EditorState) → ?Transaction
  //   Allows the plugin to append another transaction to be applied
  //   after the given array of transactions. When another plugin
  //   appends a transaction after this was called, it is called again
  //   with the new state and new transactions—but only the new
  //   transactions, i.e. it won't be passed transactions that it
  //   already saw.

  function bindProps(obj, self, target) {
    for (var prop in obj) {
      var val = obj[prop];
      if (val instanceof Function) { val = val.bind(self); }
      else if (prop == "handleDOMEvents") { val = bindProps(val, self, {}); }
      target[prop] = val;
    }
    return target
  }

  // ::- Plugins bundle functionality that can be added to an editor.
  // They are part of the [editor state](#state.EditorState) and
  // may influence that state and the view that contains it.
  var Plugin = function Plugin(spec) {
    // :: EditorProps
    // The [props](#view.EditorProps) exported by this plugin.
    this.props = {};
    if (spec.props) { bindProps(spec.props, this, this.props); }
    // :: Object
    // The plugin's [spec object](#state.PluginSpec).
    this.spec = spec;
    this.key = spec.key ? spec.key.key : createKey("plugin");
  };

  // :: (EditorState) → any
  // Extract the plugin's state field from an editor state.
  Plugin.prototype.getState = function getState (state) { return state[this.key] };

  // StateField:: interface<T>
  // A plugin spec may provide a state field (under its
  // [`state`](#state.PluginSpec.state) property) of this type, which
  // describes the state it wants to keep. Functions provided here are
  // always called with the plugin instance as their `this` binding.
  //
  //   init:: (config: Object, instance: EditorState) → T
  //   Initialize the value of the field. `config` will be the object
  //   passed to [`EditorState.create`](#state.EditorState^create). Note
  //   that `instance` is a half-initialized state instance, and will
  //   not have values for plugin fields initialized after this one.
  //
  //   apply:: (tr: Transaction, value: T, oldState: EditorState, newState: EditorState) → T
  //   Apply the given transaction to this state field, producing a new
  //   field value. Note that the `newState` argument is again a partially
  //   constructed state does not yet contain the state from plugins
  //   coming after this one.
  //
  //   toJSON:: ?(value: T) → *
  //   Convert this field to JSON. Optional, can be left off to disable
  //   JSON serialization for the field.
  //
  //   fromJSON:: ?(config: Object, value: *, state: EditorState) → T
  //   Deserialize the JSON representation of this field. Note that the
  //   `state` argument is again a half-initialized state.

  var keys = Object.create(null);

  function createKey(name) {
    if (name in keys) { return name + "$" + ++keys[name] }
    keys[name] = 0;
    return name + "$"
  }

  // ::- A key is used to [tag](#state.PluginSpec.key)
  // plugins in a way that makes it possible to find them, given an
  // editor state. Assigning a key does mean only one plugin of that
  // type can be active in a state.
  var PluginKey = function PluginKey(name) {
  if ( name === void 0 ) name = "key";
   this.key = createKey(name); };

  // :: (EditorState) → ?Plugin
  // Get the active plugin with this key, if any, from an editor
  // state.
  PluginKey.prototype.get = function get (state) { return state.config.pluginsByKey[this.key] };

  // :: (EditorState) → ?any
  // Get the plugin's state from an editor state.
  PluginKey.prototype.getState = function getState (state) { return state[this.key] };

  exports.Selection = Selection;
  exports.SelectionRange = SelectionRange;
  exports.TextSelection = TextSelection;
  exports.NodeSelection = NodeSelection;
  exports.AllSelection = AllSelection;
  exports.Transaction = Transaction;
  exports.EditorState = EditorState;
  exports.Plugin = Plugin;
  exports.PluginKey = PluginKey;

  });

  unwrapExports(dist$3);
  var dist_1$2 = dist$3.Selection;
  var dist_2$2 = dist$3.SelectionRange;
  var dist_3$2 = dist$3.TextSelection;
  var dist_4$2 = dist$3.NodeSelection;
  var dist_5$2 = dist$3.AllSelection;
  var dist_6$2 = dist$3.Transaction;
  var dist_7$2 = dist$3.EditorState;
  var dist_8$2 = dist$3.Plugin;
  var dist_9$2 = dist$3.PluginKey;

  var dist$4 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, '__esModule', { value: true });





  var result = {};
  if (typeof navigator != "undefined" && typeof document != "undefined") {
    var ie_edge = /Edge\/(\d+)/.exec(navigator.userAgent);
    var ie_upto10 = /MSIE \d/.test(navigator.userAgent);
    var ie_11up = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);

    result.mac = /Mac/.test(navigator.platform);
    var ie = result.ie = !!(ie_upto10 || ie_11up || ie_edge);
    result.ie_version = ie_upto10 ? document.documentMode || 6 : ie_11up ? +ie_11up[1] : ie_edge ? +ie_edge[1] : null;
    result.gecko = !ie && /gecko\/(\d+)/i.test(navigator.userAgent);
    result.gecko_version = result.gecko && +(/Firefox\/(\d+)/.exec(navigator.userAgent) || [0, 0])[1];
    var chrome = !ie && /Chrome\/(\d+)/.exec(navigator.userAgent);
    result.chrome = !!chrome;
    result.chrome_version = chrome && +chrome[1];
    result.ios = !ie && /AppleWebKit/.test(navigator.userAgent) && /Mobile\/\w+/.test(navigator.userAgent);
    result.android = /Android \d/.test(navigator.userAgent);
    result.webkit = !ie && 'WebkitAppearance' in document.documentElement.style;
    result.safari = /Apple Computer/.test(navigator.vendor);
    result.webkit_version = result.webkit && +(/\bAppleWebKit\/(\d+)/.exec(navigator.userAgent) || [0, 0])[1];
  }

  var domIndex = function(node) {
    for (var index = 0;; index++) {
      node = node.previousSibling;
      if (!node) { return index }
    }
  };

  var parentNode = function(node) {
    var parent = node.parentNode;
    return parent && parent.nodeType == 11 ? parent.host : parent
  };

  var textRange = function(node, from, to) {
    var range = document.createRange();
    range.setEnd(node, to == null ? node.nodeValue.length : to);
    range.setStart(node, from || 0);
    return range
  };

  // Scans forward and backward through DOM positions equivalent to the
  // given one to see if the two are in the same place (i.e. after a
  // text node vs at the end of that text node)
  var isEquivalentPosition = function(node, off, targetNode, targetOff) {
    return targetNode && (scanFor(node, off, targetNode, targetOff, -1) ||
                          scanFor(node, off, targetNode, targetOff, 1))
  };

  var atomElements = /^(img|br|input|textarea|hr)$/i;

  function scanFor(node, off, targetNode, targetOff, dir) {
    for (;;) {
      if (node == targetNode && off == targetOff) { return true }
      if (off == (dir < 0 ? 0 : nodeSize(node)) || node.nodeType == 3 && node.nodeValue == "\ufeff") {
        var parent = node.parentNode;
        if (parent.nodeType != 1 || hasBlockDesc(node) || atomElements.test(node.nodeName) || node.contentEditable == "false")
          { return false }
        off = domIndex(node) + (dir < 0 ? 0 : 1);
        node = parent;
      } else if (node.nodeType == 1) {
        node = node.childNodes[off + (dir < 0 ? -1 : 0)];
        off = dir < 0 ? nodeSize(node) : 0;
      } else {
        return false
      }
    }
  }

  function nodeSize(node) {
    return node.nodeType == 3 ? node.nodeValue.length : node.childNodes.length
  }

  function hasBlockDesc(dom) {
    var desc = dom.pmViewDesc;
    return desc && desc.node && desc.node.isBlock
  }

  // Work around Chrome issue https://bugs.chromium.org/p/chromium/issues/detail?id=447523
  // (isCollapsed inappropriately returns true in shadow dom)
  var selectionCollapsed = function(domSel) {
    var collapsed = domSel.isCollapsed;
    if (collapsed && result.chrome && domSel.rangeCount && !domSel.getRangeAt(0).collapsed)
      { collapsed = false; }
    return collapsed
  };

  function keyEvent(keyCode, key) {
    var event = document.createEvent("Event");
    event.initEvent("keydown", true, true);
    event.keyCode = keyCode;
    event.key = event.code = key;
    return event
  }

  function windowRect(win) {
    return {left: 0, right: win.innerWidth,
            top: 0, bottom: win.innerHeight}
  }

  function getSide(value, side) {
    return typeof value == "number" ? value : value[side]
  }

  function scrollRectIntoView(view, rect, startDOM) {
    var scrollThreshold = view.someProp("scrollThreshold") || 0, scrollMargin = view.someProp("scrollMargin") || 5;
    var doc = view.dom.ownerDocument, win = doc.defaultView;
    for (var parent = startDOM || view.dom;; parent = parentNode(parent)) {
      if (!parent) { break }
      if (parent.nodeType != 1) { continue }
      var atTop = parent == doc.body || parent.nodeType != 1;
      var bounding = atTop ? windowRect(win) : parent.getBoundingClientRect();
      var moveX = 0, moveY = 0;
      if (rect.top < bounding.top + getSide(scrollThreshold, "top"))
        { moveY = -(bounding.top - rect.top + getSide(scrollMargin, "top")); }
      else if (rect.bottom > bounding.bottom - getSide(scrollThreshold, "bottom"))
        { moveY = rect.bottom - bounding.bottom + getSide(scrollMargin, "bottom"); }
      if (rect.left < bounding.left + getSide(scrollThreshold, "left"))
        { moveX = -(bounding.left - rect.left + getSide(scrollMargin, "left")); }
      else if (rect.right > bounding.right - getSide(scrollThreshold, "right"))
        { moveX = rect.right - bounding.right + getSide(scrollMargin, "right"); }
      if (moveX || moveY) {
        if (atTop) {
          win.scrollBy(moveX, moveY);
        } else {
          if (moveY) { parent.scrollTop += moveY; }
          if (moveX) { parent.scrollLeft += moveX; }
        }
      }
      if (atTop) { break }
    }
  }

  // Store the scroll position of the editor's parent nodes, along with
  // the top position of an element near the top of the editor, which
  // will be used to make sure the visible viewport remains stable even
  // when the size of the content above changes.
  function storeScrollPos(view) {
    var rect = view.dom.getBoundingClientRect(), startY = Math.max(0, rect.top);
    var doc = view.dom.ownerDocument;
    var refDOM, refTop;
    for (var x = (rect.left + rect.right) / 2, y = startY + 1;
         y < Math.min(innerHeight, rect.bottom); y += 5) {
      var dom = view.root.elementFromPoint(x, y);
      if (dom == view.dom || !view.dom.contains(dom)) { continue }
      var localRect = dom.getBoundingClientRect();
      if (localRect.top >= startY - 20) {
        refDOM = dom;
        refTop = localRect.top;
        break
      }
    }
    var stack = [];
    for (var dom$1 = view.dom; dom$1; dom$1 = parentNode(dom$1)) {
      stack.push({dom: dom$1, top: dom$1.scrollTop, left: dom$1.scrollLeft});
      if (dom$1 == doc.body) { break }
    }
    return {refDOM: refDOM, refTop: refTop, stack: stack}
  }

  // Reset the scroll position of the editor's parent nodes to that what
  // it was before, when storeScrollPos was called.
  function resetScrollPos(ref) {
    var refDOM = ref.refDOM;
    var refTop = ref.refTop;
    var stack = ref.stack;

    var newRefTop = refDOM ? refDOM.getBoundingClientRect().top : 0;
    var dTop = newRefTop == 0 ? 0 : newRefTop - refTop;
    for (var i = 0; i < stack.length; i++) {
      var ref$1 = stack[i];
      var dom = ref$1.dom;
      var top = ref$1.top;
      var left = ref$1.left;
      if (dom.scrollTop != top + dTop) { dom.scrollTop = top + dTop; }
      if (dom.scrollLeft != left) { dom.scrollLeft = left; }
    }
  }

  function findOffsetInNode(node, coords) {
    var closest, dxClosest = 2e8, coordsClosest, offset = 0;
    var rowBot = coords.top, rowTop = coords.top;
    for (var child = node.firstChild, childIndex = 0; child; child = child.nextSibling, childIndex++) {
      var rects = (void 0);
      if (child.nodeType == 1) { rects = child.getClientRects(); }
      else if (child.nodeType == 3) { rects = textRange(child).getClientRects(); }
      else { continue }

      for (var i = 0; i < rects.length; i++) {
        var rect = rects[i];
        if (rect.top <= rowBot && rect.bottom >= rowTop) {
          rowBot = Math.max(rect.bottom, rowBot);
          rowTop = Math.min(rect.top, rowTop);
          var dx = rect.left > coords.left ? rect.left - coords.left
              : rect.right < coords.left ? coords.left - rect.right : 0;
          if (dx < dxClosest) {
            closest = child;
            dxClosest = dx;
            coordsClosest = dx && closest.nodeType == 3 ? {left: rect.right < coords.left ? rect.right : rect.left, top: coords.top} : coords;
            if (child.nodeType == 1 && dx)
              { offset = childIndex + (coords.left >= (rect.left + rect.right) / 2 ? 1 : 0); }
            continue
          }
        }
        if (!closest && (coords.left >= rect.right && coords.top >= rect.top ||
                         coords.left >= rect.left && coords.top >= rect.bottom))
          { offset = childIndex + 1; }
      }
    }
    if (closest && closest.nodeType == 3) { return findOffsetInText(closest, coordsClosest) }
    if (!closest || (dxClosest && closest.nodeType == 1)) { return {node: node, offset: offset} }
    return findOffsetInNode(closest, coordsClosest)
  }

  function findOffsetInText(node, coords) {
    var len = node.nodeValue.length;
    var range = document.createRange();
    for (var i = 0; i < len; i++) {
      range.setEnd(node, i + 1);
      range.setStart(node, i);
      var rect = singleRect(range, 1);
      if (rect.top == rect.bottom) { continue }
      if (inRect(coords, rect))
        { return {node: node, offset: i + (coords.left >= (rect.left + rect.right) / 2 ? 1 : 0)} }
    }
    return {node: node, offset: 0}
  }

  function inRect(coords, rect) {
    return coords.left >= rect.left - 1 && coords.left <= rect.right + 1&&
      coords.top >= rect.top - 1 && coords.top <= rect.bottom + 1
  }

  function targetKludge(dom, coords) {
    var parent = dom.parentNode;
    if (parent && /^li$/i.test(parent.nodeName) && coords.left < dom.getBoundingClientRect().left)
      { return parent }
    return dom
  }

  function posFromElement(view, elt, coords) {
    var ref = findOffsetInNode(elt, coords);
    var node = ref.node;
    var offset = ref.offset;
    var bias = -1;
    if (node.nodeType == 1 && !node.firstChild) {
      var rect = node.getBoundingClientRect();
      bias = rect.left != rect.right && coords.left > (rect.left + rect.right) / 2 ? 1 : -1;
    }
    return view.docView.posFromDOM(node, offset, bias)
  }

  function posFromCaret(view, node, offset, coords) {
    // Browser (in caretPosition/RangeFromPoint) will agressively
    // normalize towards nearby inline nodes. Since we are interested in
    // positions between block nodes too, we first walk up the hierarchy
    // of nodes to see if there are block nodes that the coordinates
    // fall outside of. If so, we take the position before/after that
    // block. If not, we call `posFromDOM` on the raw node/offset.
    var outside = -1;
    for (var cur = node;;) {
      if (cur == view.dom) { break }
      var desc = view.docView.nearestDesc(cur, true);
      if (!desc) { return null }
      if (desc.node.isBlock && desc.parent) {
        var rect = desc.dom.getBoundingClientRect();
        if (rect.left > coords.left || rect.top > coords.top) { outside = desc.posBefore; }
        else if (rect.right < coords.left || rect.bottom < coords.top) { outside = desc.posAfter; }
        else { break }
      }
      cur = desc.dom.parentNode;
    }
    return outside > -1 ? outside : view.docView.posFromDOM(node, offset)
  }

  function elementFromPoint(element, coords, box) {
    var len = element.childNodes.length;
    if (len && box.top < box.bottom) {
      for (var startI = Math.max(0, Math.floor(len * (coords.top - box.top) / (box.bottom - box.top)) - 2), i = startI;;) {
        var child = element.childNodes[i];
        if (child.nodeType == 1) {
          var rects = child.getClientRects();
          for (var j = 0; j < rects.length; j++) {
            var rect = rects[j];
            if (inRect(coords, rect)) { return elementFromPoint(child, coords, rect) }
          }
        }
        if ((i = (i + 1) % len) == startI) { break }
      }
    }
    return element
  }

  // Given an x,y position on the editor, get the position in the document.
  function posAtCoords(view, coords) {
    var root = view.root, node, offset;
    if (root.caretPositionFromPoint) {
      var pos$1 = root.caretPositionFromPoint(coords.left, coords.top);
      if (pos$1) { var assign;
        ((assign = pos$1, node = assign.offsetNode, offset = assign.offset)); }
    }
    if (!node && root.caretRangeFromPoint) {
      var range = root.caretRangeFromPoint(coords.left, coords.top);
      if (range) { var assign$1;
        ((assign$1 = range, node = assign$1.startContainer, offset = assign$1.startOffset)); }
    }

    var elt = root.elementFromPoint(coords.left, coords.top + 1), pos;
    if (!elt || !view.dom.contains(elt.nodeType != 1 ? elt.parentNode : elt)) {
      var box = view.dom.getBoundingClientRect();
      if (!inRect(coords, box)) { return null }
      elt = elementFromPoint(view.dom, coords, box);
      if (!elt) { return null }
    }
    elt = targetKludge(elt, coords);
    if (node) {
      // Suspiciously specific kludge to work around caret*FromPoint
      // never returning a position at the end of the document
      if (node == view.dom && offset == node.childNodes.length - 1 && node.lastChild.nodeType == 1 &&
          coords.top > node.lastChild.getBoundingClientRect().bottom)
        { pos = view.state.doc.content.size; }
      // Ignore positions directly after a BR, since caret*FromPoint
      // 'round up' positions that would be more accurately placed
      // before the BR node.
      else if (offset == 0 || node.nodeType != 1 || node.childNodes[offset - 1].nodeName != "BR")
        { pos = posFromCaret(view, node, offset, coords); }
    }
    if (pos == null) { pos = posFromElement(view, elt, coords); }

    var desc = view.docView.nearestDesc(elt, true);
    return {pos: pos, inside: desc ? desc.posAtStart - desc.border : -1}
  }

  function singleRect(object, bias) {
    var rects = object.getClientRects();
    return !rects.length ? object.getBoundingClientRect() : rects[bias < 0 ? 0 : rects.length - 1]
  }

  // : (EditorView, number) → {left: number, top: number, right: number, bottom: number}
  // Given a position in the document model, get a bounding box of the
  // character at that position, relative to the window.
  function coordsAtPos(view, pos) {
    var ref = view.docView.domFromPos(pos);
    var node = ref.node;
    var offset = ref.offset;

    // These browsers support querying empty text ranges
    if (node.nodeType == 3 && (result.chrome || result.gecko)) {
      var rect = singleRect(textRange(node, offset, offset), 0);
      // Firefox returns bad results (the position before the space)
      // when querying a position directly after line-broken
      // whitespace. Detect this situation and and kludge around it
      if (result.gecko && offset && /\s/.test(node.nodeValue[offset - 1]) && offset < node.nodeValue.length) {
        var rectBefore = singleRect(textRange(node, offset - 1, offset - 1), -1);
        if (Math.abs(rectBefore.left - rect.left) < 1 && rectBefore.top == rect.top) {
          var rectAfter = singleRect(textRange(node, offset, offset + 1), -1);
          return flattenV(rectAfter, rectAfter.left < rectBefore.left)
        }
      }
      return rect
    }

    if (node.nodeType == 1 && !view.state.doc.resolve(pos).parent.inlineContent) {
      // Return a horizontal line in block context
      var top = true, rect$1;
      if (offset < node.childNodes.length) {
        var after = node.childNodes[offset];
        if (after.nodeType == 1) { rect$1 = after.getBoundingClientRect(); }
      }
      if (!rect$1 && offset) {
        var before = node.childNodes[offset - 1];
        if (before.nodeType == 1) { rect$1 = before.getBoundingClientRect(); top = false; }
      }
      return flattenH(rect$1 || node.getBoundingClientRect(), top)
    }

    // Not Firefox/Chrome, or not in a text node, so we have to use
    // actual element/character rectangles to get a solution (this part
    // is not very bidi-safe)
    //
    // Try the left side first, fall back to the right one if that
    // doesn't work.
    for (var dir = -1; dir < 2; dir += 2) {
      if (dir < 0 && offset) {
        var prev = (void 0), target = node.nodeType == 3 ? textRange(node, offset - 1, offset)
            : (prev = node.childNodes[offset - 1]).nodeType == 3 ? textRange(prev)
            : prev.nodeType == 1 && prev.nodeName != "BR" ? prev : null; // BR nodes tend to only return the rectangle before them
        if (target) {
          var rect$2 = singleRect(target, 1);
          if (rect$2.top < rect$2.bottom) { return flattenV(rect$2, false) }
        }
      } else if (dir > 0 && offset < nodeSize(node)) {
        var next = (void 0), target$1 = node.nodeType == 3 ? textRange(node, offset, offset + 1)
            : (next = node.childNodes[offset]).nodeType == 3 ? textRange(next)
            : next.nodeType == 1 ? next : null;
        if (target$1) {
          var rect$3 = singleRect(target$1, -1);
          if (rect$3.top < rect$3.bottom) { return flattenV(rect$3, true) }
        }
      }
    }
    // All else failed, just try to get a rectangle for the target node
    return flattenV(singleRect(node.nodeType == 3 ? textRange(node) : node, 0), false)
  }

  function flattenV(rect, left) {
    if (rect.width == 0) { return rect }
    var x = left ? rect.left : rect.right;
    return {top: rect.top, bottom: rect.bottom, left: x, right: x}
  }

  function flattenH(rect, top) {
    if (rect.height == 0) { return rect }
    var y = top ? rect.top : rect.bottom;
    return {top: y, bottom: y, left: rect.left, right: rect.right}
  }

  function withFlushedState(view, state, f) {
    var viewState = view.state, active = view.root.activeElement;
    if (viewState != state) { view.updateState(state); }
    if (active != view.dom) { view.focus(); }
    try {
      return f()
    } finally {
      if (viewState != state) { view.updateState(viewState); }
      if (active != view.dom) { active.focus(); }
    }
  }

  // : (EditorView, number, number)
  // Whether vertical position motion in a given direction
  // from a position would leave a text block.
  function endOfTextblockVertical(view, state, dir) {
    var sel = state.selection;
    var $pos = dir == "up" ? sel.$anchor.min(sel.$head) : sel.$anchor.max(sel.$head);
    return withFlushedState(view, state, function () {
      var ref = view.docView.domFromPos($pos.pos);
      var dom = ref.node;
      for (;;) {
        var nearest = view.docView.nearestDesc(dom, true);
        if (!nearest) { break }
        if (nearest.node.isBlock) { dom = nearest.dom; break }
        dom = nearest.dom.parentNode;
      }
      var coords = coordsAtPos(view, $pos.pos);
      for (var child = dom.firstChild; child; child = child.nextSibling) {
        var boxes = (void 0);
        if (child.nodeType == 1) { boxes = child.getClientRects(); }
        else if (child.nodeType == 3) { boxes = textRange(child, 0, child.nodeValue.length).getClientRects(); }
        else { continue }
        for (var i = 0; i < boxes.length; i++) {
          var box = boxes[i];
          if (box.bottom > box.top && (dir == "up" ? box.bottom < coords.top + 1 : box.top > coords.bottom - 1))
            { return false }
        }
      }
      return true
    })
  }

  var maybeRTL = /[\u0590-\u08ac]/;

  function endOfTextblockHorizontal(view, state, dir) {
    var ref = state.selection;
    var $head = ref.$head;
    if (!$head.parent.isTextblock) { return false }
    var offset = $head.parentOffset, atStart = !offset, atEnd = offset == $head.parent.content.size;
    var sel = getSelection();
    // If the textblock is all LTR, or the browser doesn't support
    // Selection.modify (Edge), fall back to a primitive approach
    if (!maybeRTL.test($head.parent.textContent) || !sel.modify)
      { return dir == "left" || dir == "backward" ? atStart : atEnd }

    return withFlushedState(view, state, function () {
      // This is a huge hack, but appears to be the best we can
      // currently do: use `Selection.modify` to move the selection by
      // one character, and see if that moves the cursor out of the
      // textblock (or doesn't move it at all, when at the start/end of
      // the document).
      var oldRange = sel.getRangeAt(0), oldNode = sel.focusNode, oldOff = sel.focusOffset;
      sel.modify("move", dir, "character");
      var parentDOM = $head.depth ? view.docView.domAfterPos($head.before()) : view.dom;
      var result$$1 = !parentDOM.contains(sel.focusNode.nodeType == 1 ? sel.focusNode : sel.focusNode.parentNode) ||
          (oldNode == sel.focusNode && oldOff == sel.focusOffset);
      // Restore the previous selection
      sel.removeAllRanges();
      sel.addRange(oldRange);
      return result$$1
    })
  }

  var cachedState = null;
  var cachedDir = null;
  var cachedResult = false;
  function endOfTextblock(view, state, dir) {
    if (cachedState == state && cachedDir == dir) { return cachedResult }
    cachedState = state; cachedDir = dir;
    return cachedResult = dir == "up" || dir == "down"
      ? endOfTextblockVertical(view, state, dir)
      : endOfTextblockHorizontal(view, state, dir)
  }

  // NodeView:: interface
  //
  // By default, document nodes are rendered using the result of the
  // [`toDOM`](#model.NodeSpec.toDOM) method of their spec, and managed
  // entirely by the editor. For some use cases, such as embedded
  // node-specific editing interfaces, you want more control over
  // the behavior of a node's in-editor representation, and need to
  // [define](#view.EditorProps.nodeViews) a custom node view.
  //
  // Objects returned as node views must conform to this interface.
  //
  //   dom:: ?dom.Node
  //   The outer DOM node that represents the document node. When not
  //   given, the default strategy is used to create a DOM node.
  //
  //   contentDOM:: ?dom.Node
  //   The DOM node that should hold the node's content. Only meaningful
  //   if the node view also defines a `dom` property and if its node
  //   type is not a leaf node type. When this is present, ProseMirror
  //   will take care of rendering the node's children into it. When it
  //   is not present, the node view itself is responsible for rendering
  //   (or deciding not to render) its child nodes.
  //
  //   update:: ?(node: Node, decorations: [Decoration]) → bool
  //   When given, this will be called when the view is updating itself.
  //   It will be given a node (possibly of a different type), and an
  //   array of active decorations (which are automatically drawn, and
  //   the node view may ignore if it isn't interested in them), and
  //   should return true if it was able to update to that node, and
  //   false otherwise. If the node view has a `contentDOM` property (or
  //   no `dom` property), updating its child nodes will be handled by
  //   ProseMirror.
  //
  //   selectNode:: ?()
  //   Can be used to override the way the node's selected status (as a
  //   node selection) is displayed.
  //
  //   deselectNode:: ?()
  //   When defining a `selectNode` method, you should also provide a
  //   `deselectNode` method to remove the effect again.
  //
  //   setSelection:: ?(anchor: number, head: number, root: dom.Document)
  //   This will be called to handle setting the selection inside the
  //   node. The `anchor` and `head` positions are relative to the start
  //   of the node. By default, a DOM selection will be created between
  //   the DOM positions corresponding to those positions, but if you
  //   override it you can do something else.
  //
  //   stopEvent:: ?(event: dom.Event) → bool
  //   Can be used to prevent the editor view from trying to handle some
  //   or all DOM events that bubble up from the node view. Events for
  //   which this returns true are not handled by the editor.
  //
  //   ignoreMutation:: ?(dom.MutationRecord) → bool
  //   Called when a DOM
  //   [mutation](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)
  //   happens within the view. Return false if the editor should
  //   re-parse the range around the mutation, true if it can safely be
  //   ignored.
  //
  //   destroy:: ?()
  //   Called when the node view is removed from the editor or the whole
  //   editor is destroyed.

  // View descriptions are data structures that describe the DOM that is
  // used to represent the editor's content. They are used for:
  //
  // - Incremental redrawing when the document changes
  //
  // - Figuring out what part of the document a given DOM position
  //   corresponds to
  //
  // - Wiring in custom implementations of the editing interface for a
  //   given node
  //
  // They form a doubly-linked mutable tree, starting at `view.docView`.

  var NOT_DIRTY = 0;
  var CHILD_DIRTY = 1;
  var CONTENT_DIRTY = 2;
  var NODE_DIRTY = 3;

  // Superclass for the various kinds of descriptions. Defines their
  // basic structure and shared methods.
  var ViewDesc = function ViewDesc(parent, children, dom, contentDOM) {
    this.parent = parent;
    this.children = children;
    this.dom = dom;
    // An expando property on the DOM node provides a link back to its
    // description.
    dom.pmViewDesc = this;
    // This is the node that holds the child views. It may be null for
    // descs that don't have children.
    this.contentDOM = contentDOM;
    this.dirty = NOT_DIRTY;
  };

  var prototypeAccessors$1 = { beforePosition: {},size: {},border: {},posBefore: {},posAtStart: {},posAfter: {},posAtEnd: {},contentLost: {} };

  // Used to check whether a given description corresponds to a
  // widget/mark/node.
  ViewDesc.prototype.matchesWidget = function matchesWidget () { return false };
  ViewDesc.prototype.matchesMark = function matchesMark () { return false };
  ViewDesc.prototype.matchesNode = function matchesNode () { return false };
  ViewDesc.prototype.matchesHack = function matchesHack () { return false };

  prototypeAccessors$1.beforePosition.get = function () { return false };

  // : () → ?ParseRule
  // When parsing in-editor content (in domchange.js), we allow
  // descriptions to determine the parse rules that should be used to
  // parse them.
  ViewDesc.prototype.parseRule = function parseRule () { return null };

  // : (dom.Event) → bool
  // Used by the editor's event handler to ignore events that come
  // from certain descs.
  ViewDesc.prototype.stopEvent = function stopEvent () { return false };

  // The size of the content represented by this desc.
  prototypeAccessors$1.size.get = function () {
      var this$1 = this;

    var size = 0;
    for (var i = 0; i < this.children.length; i++) { size += this$1.children[i].size; }
    return size
  };

  // For block nodes, this represents the space taken up by their
  // start/end tokens.
  prototypeAccessors$1.border.get = function () { return 0 };

  ViewDesc.prototype.destroy = function destroy () {
      var this$1 = this;

    this.parent = null;
    if (this.dom.pmViewDesc == this) { this.dom.pmViewDesc = null; }
    for (var i = 0; i < this.children.length; i++)
      { this$1.children[i].destroy(); }
  };

  ViewDesc.prototype.posBeforeChild = function posBeforeChild (child) {
      var this$1 = this;

    for (var i = 0, pos = this.posAtStart; i < this.children.length; i++) {
      var cur = this$1.children[i];
      if (cur == child) { return pos }
      pos += cur.size;
    }
  };

  prototypeAccessors$1.posBefore.get = function () {
    return this.parent.posBeforeChild(this)
  };

  prototypeAccessors$1.posAtStart.get = function () {
    return this.parent ? this.parent.posBeforeChild(this) + this.border : 0
  };

  prototypeAccessors$1.posAfter.get = function () {
    return this.posBefore + this.size
  };

  prototypeAccessors$1.posAtEnd.get = function () {
    return this.posAtStart + this.size - 2 * this.border
  };

  // : (dom.Node, number, ?number) → number
  ViewDesc.prototype.localPosFromDOM = function localPosFromDOM (dom, offset, bias) {
      var this$1 = this;

    // If the DOM position is in the content, use the child desc after
    // it to figure out a position.
    if (this.contentDOM && this.contentDOM.contains(dom.nodeType == 1 ? dom : dom.parentNode)) {
      if (bias < 0) {
        var domBefore, desc;
        if (dom == this.contentDOM) {
          domBefore = dom.childNodes[offset - 1];
        } else {
          while (dom.parentNode != this.contentDOM) { dom = dom.parentNode; }
          domBefore = dom.previousSibling;
        }
        while (domBefore && !((desc = domBefore.pmViewDesc) && desc.parent == this)) { domBefore = domBefore.previousSibling; }
        return domBefore ? this.posBeforeChild(desc) + desc.size : this.posAtStart
      } else {
        var domAfter, desc$1;
        if (dom == this.contentDOM) {
          domAfter = dom.childNodes[offset];
        } else {
          while (dom.parentNode != this.contentDOM) { dom = dom.parentNode; }
          domAfter = dom.nextSibling;
        }
        while (domAfter && !((desc$1 = domAfter.pmViewDesc) && desc$1.parent == this)) { domAfter = domAfter.nextSibling; }
        return domAfter ? this.posBeforeChild(desc$1) : this.posAtEnd
      }
    }
    // Otherwise, use various heuristics, falling back on the bias
    // parameter, to determine whether to return the position at the
    // start or at the end of this view desc.
    var atEnd;
    if (this.contentDOM && this.contentDOM != this.dom && this.dom.contains(this.contentDOM)) {
      atEnd = dom.compareDocumentPosition(this.contentDOM) & 2;
    } else if (this.dom.firstChild) {
      if (offset == 0) { for (var search = dom;; search = search.parentNode) {
        if (search == this$1.dom) { atEnd = false; break }
        if (search.parentNode.firstChild != search) { break }
      } }
      if (atEnd == null && offset == dom.childNodes.length) { for (var search$1 = dom;; search$1 = search$1.parentNode) {
        if (search$1 == this$1.dom) { atEnd = true; break }
        if (search$1.parentNode.lastChild != search$1) { break }
      } }
    }
    return (atEnd == null ? bias > 0 : atEnd) ? this.posAtEnd : this.posAtStart
  };

  // Scan up the dom finding the first desc that is a descendant of
  // this one.
  ViewDesc.prototype.nearestDesc = function nearestDesc (dom, onlyNodes) {
      var this$1 = this;

    for (var first = true, cur = dom; cur; cur = cur.parentNode) {
      var desc = this$1.getDesc(cur);
      if (desc && (!onlyNodes || desc.node)) {
        // If dom is outside of this desc's nodeDOM, don't count it.
        if (first && desc.nodeDOM && !(desc.nodeDOM.nodeType == 1 ? desc.nodeDOM.contains(dom) : desc.nodeDOM == dom)) { first = false; }
        else { return desc }
      }
    }
  };

  ViewDesc.prototype.getDesc = function getDesc (dom) {
      var this$1 = this;

    var desc = dom.pmViewDesc;
    for (var cur = desc; cur; cur = cur.parent) { if (cur == this$1) { return desc } }
  };

  ViewDesc.prototype.posFromDOM = function posFromDOM (dom, offset, bias) {
      var this$1 = this;

    for (var scan = dom;; scan = scan.parentNode) {
      var desc = this$1.getDesc(scan);
      if (desc) { return desc.localPosFromDOM(dom, offset, bias) }
    }
  };

  // : (number) → ?NodeViewDesc
  // Find the desc for the node after the given pos, if any. (When a
  // parent node overrode rendering, there might not be one.)
  ViewDesc.prototype.descAt = function descAt (pos) {
      var this$1 = this;

    for (var i = 0, offset = 0; i < this.children.length; i++) {
      var child = this$1.children[i], end = offset + child.size;
      if (offset == pos && end != offset) {
        while (!child.border && child.children.length) { child = child.children[0]; }
        return child
      }
      if (pos < end) { return child.descAt(pos - offset - child.border) }
      offset = end;
    }
  };

  // : (number) → {node: dom.Node, offset: number}
  ViewDesc.prototype.domFromPos = function domFromPos (pos) {
      var this$1 = this;

    if (!this.contentDOM) { return {node: this.dom, offset: 0} }
    for (var offset = 0, i = 0;; i++) {
      if (offset == pos) {
        while (i < this.children.length && this.children[i].beforePosition) { i++; }
        return {node: this$1.contentDOM, offset: i}
      }
      if (i == this$1.children.length) { throw new Error("Invalid position " + pos) }
      var child = this$1.children[i], end = offset + child.size;
      if (pos < end) { return child.domFromPos(pos - offset - child.border) }
      offset = end;
    }
  };

  // Used to find a DOM range in a single parent for a given changed
  // range.
  ViewDesc.prototype.parseRange = function parseRange (from, to, base) {
      var this$1 = this;
      if ( base === void 0 ) base = 0;

    if (this.children.length == 0)
      { return {node: this.contentDOM, from: from, to: to, fromOffset: 0, toOffset: this.contentDOM.childNodes.length} }

    var fromOffset = -1, toOffset = -1;
    for (var offset = 0, i = 0;; i++) {
      var child = this$1.children[i], end = offset + child.size;
      if (fromOffset == -1 && from <= end) {
        var childBase = offset + child.border;
        // FIXME maybe descend mark views to parse a narrower range?
        if (from >= childBase && to <= end - child.border && child.node &&
            child.contentDOM && this$1.contentDOM.contains(child.contentDOM))
          { return child.parseRange(from - childBase, to - childBase, base + childBase) }

        from = base + offset;
        for (var j = i; j > 0; j--) {
          var prev = this$1.children[j - 1];
          if (prev.size && prev.dom.parentNode == this$1.contentDOM && !prev.emptyChildAt(1)) {
            fromOffset = domIndex(prev.dom) + 1;
            break
          }
          from -= prev.size;
        }
        if (fromOffset == -1) { fromOffset = 0; }
      }
      if (fromOffset > -1 && to <= end) {
        to = base + end;
        for (var j$1 = i + 1; j$1 < this.children.length; j$1++) {
          var next = this$1.children[j$1];
          if (next.size && next.dom.parentNode == this$1.contentDOM && !next.emptyChildAt(-1)) {
            toOffset = domIndex(next.dom);
            break
          }
          to += next.size;
        }
        if (toOffset == -1) { toOffset = this$1.contentDOM.childNodes.length; }
        break
      }
      offset = end;
    }
    return {node: this.contentDOM, from: from, to: to, fromOffset: fromOffset, toOffset: toOffset}
  };

  ViewDesc.prototype.emptyChildAt = function emptyChildAt (side) {
    if (this.border || !this.contentDOM || !this.children.length) { return false }
    var child = this.children[side < 0 ? 0 : this.children.length - 1];
    return child.size == 0 || child.emptyChildAt(side)
  };

  // : (number) → dom.Node
  ViewDesc.prototype.domAfterPos = function domAfterPos (pos) {
    var ref = this.domFromPos(pos);
      var node = ref.node;
      var offset = ref.offset;
    if (node.nodeType != 1 || offset == node.childNodes.length)
      { throw new RangeError("No node after pos " + pos) }
    return node.childNodes[offset]
  };

  // : (number, number, dom.Document)
  // View descs are responsible for setting any selection that falls
  // entirely inside of them, so that custom implementations can do
  // custom things with the selection. Note that this falls apart when
  // a selection starts in such a node and ends in another, in which
  // case we just use whatever domFromPos produces as a best effort.
  ViewDesc.prototype.setSelection = function setSelection (anchor, head, root, force) {
      var this$1 = this;

    // If the selection falls entirely in a child, give it to that child
    var from = Math.min(anchor, head), to = Math.max(anchor, head);
    for (var i = 0, offset = 0; i < this.children.length; i++) {
      var child = this$1.children[i], end = offset + child.size;
      if (from > offset && to < end)
        { return child.setSelection(anchor - offset - child.border, head - offset - child.border, root, force) }
      offset = end;
    }

    var anchorDOM = this.domFromPos(anchor), headDOM = this.domFromPos(head);
    var domSel = root.getSelection(), range = document.createRange();
    if (!force &&
        isEquivalentPosition(anchorDOM.node, anchorDOM.offset, domSel.anchorNode, domSel.anchorOffset) &&
        isEquivalentPosition(headDOM.node, headDOM.offset, domSel.focusNode, domSel.focusOffset))
      { return }

    // Selection.extend can be used to create an 'inverted' selection
    // (one where the focus is before the anchor), but not all
    // browsers support it yet.
    if (domSel.extend) {
      range.setEnd(anchorDOM.node, anchorDOM.offset);
      range.collapse(false);
    } else {
      if (anchor > head) { var tmp = anchorDOM; anchorDOM = headDOM; headDOM = tmp; }
      range.setEnd(headDOM.node, headDOM.offset);
      range.setStart(anchorDOM.node, anchorDOM.offset);
    }
    domSel.removeAllRanges();
    domSel.addRange(range);
    if (domSel.extend)
      { domSel.extend(headDOM.node, headDOM.offset); }
  };

  // : (dom.MutationRecord) → bool
  ViewDesc.prototype.ignoreMutation = function ignoreMutation (_mutation) {
    return !this.contentDOM
  };

  prototypeAccessors$1.contentLost.get = function () {
    return this.contentDOM && this.contentDOM != this.dom && !this.dom.contains(this.contentDOM)
  };

  // Remove a subtree of the element tree that has been touched
  // by a DOM change, so that the next update will redraw it.
  ViewDesc.prototype.markDirty = function markDirty (from, to) {
      var this$1 = this;

    for (var offset = 0, i = 0; i < this.children.length; i++) {
      var child = this$1.children[i], end = offset + child.size;
      if (offset == end ? from <= end && to >= offset : from < end && to > offset) {
        var startInside = offset + child.border, endInside = end - child.border;
        if (from >= startInside && to <= endInside) {
          this$1.dirty = from == offset || to == end ? CONTENT_DIRTY : CHILD_DIRTY;
          if (from == startInside && to == endInside && child.contentLost) { child.dirty = NODE_DIRTY; }
          else { child.markDirty(from - startInside, to - startInside); }
          return
        } else {
          child.dirty = NODE_DIRTY;
        }
      }
      offset = end;
    }
    this.dirty = CONTENT_DIRTY;
  };

  ViewDesc.prototype.markParentsDirty = function markParentsDirty () {
    for (var node = this.parent; node; node = node.parent) {
      var dirty =  CONTENT_DIRTY ;
      if (node.dirty < dirty) { node.dirty = dirty; }
    }
  };

  Object.defineProperties( ViewDesc.prototype, prototypeAccessors$1 );

  // Reused array to avoid allocating fresh arrays for things that will
  // stay empty anyway.
  var nothing = [];

  // A widget desc represents a widget decoration, which is a DOM node
  // drawn between the document nodes.
  var WidgetViewDesc = (function (ViewDesc) {
    function WidgetViewDesc(parent, widget, view, pos) {
      var self, dom = widget.type.toDOM;
      if (typeof dom == "function") { dom = dom(view, function () {
        if (!self) { return pos }
        if (self.parent) { return self.parent.posBeforeChild(self) }
      }); }
      if (!widget.type.spec.raw) {
        if (dom.nodeType != 1) {
          var wrap = document.createElement("span");
          wrap.appendChild(dom);
          dom = wrap;
        }
        dom.contentEditable = false;
        dom.classList.add("ProseMirror-widget");
      }
      ViewDesc.call(this, parent, nothing, dom, null);
      this.widget = widget;
      self = this;
    }

    if ( ViewDesc ) WidgetViewDesc.__proto__ = ViewDesc;
    WidgetViewDesc.prototype = Object.create( ViewDesc && ViewDesc.prototype );
    WidgetViewDesc.prototype.constructor = WidgetViewDesc;

    var prototypeAccessors$1 = { beforePosition: {} };

    prototypeAccessors$1.beforePosition.get = function () {
      return this.widget.type.side < 0
    };

    WidgetViewDesc.prototype.matchesWidget = function matchesWidget (widget) {
      return this.dirty == NOT_DIRTY && widget.type.eq(this.widget.type)
    };

    WidgetViewDesc.prototype.parseRule = function parseRule () { return {ignore: true} };

    WidgetViewDesc.prototype.stopEvent = function stopEvent (event) {
      var stop = this.widget.spec.stopEvent;
      return stop ? stop(event) : false
    };

    Object.defineProperties( WidgetViewDesc.prototype, prototypeAccessors$1 );

    return WidgetViewDesc;
  }(ViewDesc));

  // A cursor wrapper is used to put the cursor in when newly typed text
  // needs to be styled differently from its surrounding text (for
  // example through storedMarks), so that the style of the text doesn't
  // visually 'pop' between typing it and actually updating the view.
  var CursorWrapperDesc = (function (WidgetViewDesc) {
    function CursorWrapperDesc () {
      WidgetViewDesc.apply(this, arguments);
    }

    if ( WidgetViewDesc ) CursorWrapperDesc.__proto__ = WidgetViewDesc;
    CursorWrapperDesc.prototype = Object.create( WidgetViewDesc && WidgetViewDesc.prototype );
    CursorWrapperDesc.prototype.constructor = CursorWrapperDesc;

    CursorWrapperDesc.prototype.parseRule = function parseRule () { return {skip: withoutZeroWidthSpaces(this.dom)} };

    CursorWrapperDesc.prototype.ignoreMutation = function ignoreMutation () { return false };

    return CursorWrapperDesc;
  }(WidgetViewDesc));

  var CompositionViewDesc = (function (ViewDesc) {
    function CompositionViewDesc(parent, dom, textDOM, text) {
      ViewDesc.call(this, parent, nothing, dom, null);
      this.textDOM = textDOM;
      this.text = text;
    }

    if ( ViewDesc ) CompositionViewDesc.__proto__ = ViewDesc;
    CompositionViewDesc.prototype = Object.create( ViewDesc && ViewDesc.prototype );
    CompositionViewDesc.prototype.constructor = CompositionViewDesc;

    var prototypeAccessors$2 = { size: {} };

    prototypeAccessors$2.size.get = function () { return this.text.length };

    CompositionViewDesc.prototype.parseRule = function parseRule () { return {skip: withoutZeroWidthSpaces(this.dom)} };

    CompositionViewDesc.prototype.localPosFromDOM = function localPosFromDOM (dom, offset) {
      if (dom != this.textDOM) { return this.posAtStart + (offset ? this.size : 0) }
      var zwsp = this.textDOM.nodeValue.indexOf("\ufeff");
      return this.posAtStart + offset - (zwsp > -1 && zwsp < offset ? 1 : 0)
    };

    CompositionViewDesc.prototype.domFromPos = function domFromPos (pos) {
      var zwsp = this.textDOM.nodeValue.indexOf("\ufeff");
      return {node: this.textDOM, offset: pos + (zwsp > -1 && zwsp <= pos ? 1 : 0)}
    };

    CompositionViewDesc.prototype.ignoreMutation = function ignoreMutation () { return false };

    Object.defineProperties( CompositionViewDesc.prototype, prototypeAccessors$2 );

    return CompositionViewDesc;
  }(ViewDesc));

  // A mark desc represents a mark. May have multiple children,
  // depending on how the mark is split. Note that marks are drawn using
  // a fixed nesting order, for simplicity and predictability, so in
  // some cases they will be split more often than would appear
  // necessary.
  var MarkViewDesc = (function (ViewDesc) {
    function MarkViewDesc(parent, mark, dom, contentDOM) {
      ViewDesc.call(this, parent, [], dom, contentDOM);
      this.mark = mark;
    }

    if ( ViewDesc ) MarkViewDesc.__proto__ = ViewDesc;
    MarkViewDesc.prototype = Object.create( ViewDesc && ViewDesc.prototype );
    MarkViewDesc.prototype.constructor = MarkViewDesc;

    MarkViewDesc.create = function create (parent, mark, inline, view) {
      var custom = view.nodeViews[mark.type.name];
      var spec = custom && custom(mark, view, inline);
      if (!spec || !spec.dom)
        { spec = dist.DOMSerializer.renderSpec(document, mark.type.spec.toDOM(mark, inline)); }
      return new MarkViewDesc(parent, mark, spec.dom, spec.contentDOM || spec.dom)
    };

    MarkViewDesc.prototype.parseRule = function parseRule () { return {mark: this.mark.type.name, attrs: this.mark.attrs, contentElement: this.contentDOM} };

    MarkViewDesc.prototype.matchesMark = function matchesMark (mark) { return this.dirty != NODE_DIRTY && this.mark.eq(mark) };

    MarkViewDesc.prototype.markDirty = function markDirty (from, to) {
      ViewDesc.prototype.markDirty.call(this, from, to);
      // Move dirty info to nearest node view
      if (this.dirty != NOT_DIRTY) {
        var parent = this.parent;
        while (!parent.node) { parent = parent.parent; }
        if (parent.dirty < this.dirty) { parent.dirty = this.dirty; }
        this.dirty = NOT_DIRTY;
      }
    };

    MarkViewDesc.prototype.slice = function slice (from, to, view) {
      var copy = MarkViewDesc.create(this.parent, this.mark, true, view);
      var nodes = this.children, size = this.size;
      if (to < size) { nodes = replaceNodes(nodes, to, size, view); }
      if (from > 0) { nodes = replaceNodes(nodes, 0, from, view); }
      for (var i = 0; i < nodes.length; i++) { nodes[i].parent = copy; }
      copy.children = nodes;
      return copy
    };

    return MarkViewDesc;
  }(ViewDesc));

  // Node view descs are the main, most common type of view desc, and
  // correspond to an actual node in the document. Unlike mark descs,
  // they populate their child array themselves.
  var NodeViewDesc = (function (ViewDesc) {
    function NodeViewDesc(parent, node, outerDeco, innerDeco, dom, contentDOM, nodeDOM, view, pos) {
      ViewDesc.call(this, parent, node.isLeaf ? nothing : [], dom, contentDOM);
      this.nodeDOM = nodeDOM;
      this.node = node;
      this.outerDeco = outerDeco;
      this.innerDeco = innerDeco;
      if (contentDOM) { this.updateChildren(view, pos); }
    }

    if ( ViewDesc ) NodeViewDesc.__proto__ = ViewDesc;
    NodeViewDesc.prototype = Object.create( ViewDesc && ViewDesc.prototype );
    NodeViewDesc.prototype.constructor = NodeViewDesc;

    var prototypeAccessors$3 = { size: {},border: {} };

    // By default, a node is rendered using the `toDOM` method from the
    // node type spec. But client code can use the `nodeViews` spec to
    // supply a custom node view, which can influence various aspects of
    // the way the node works.
    //
    // (Using subclassing for this was intentionally decided against,
    // since it'd require exposing a whole slew of finnicky
    // implementation details to the user code that they probably will
    // never need.)
    NodeViewDesc.create = function create (parent, node, outerDeco, innerDeco, view, pos) {
      var custom = view.nodeViews[node.type.name], descObj;
      var spec = custom && custom(node, view, function () {
        // (This is a function that allows the custom view to find its
        // own position)
        if (!descObj) { return pos }
        if (descObj.parent) { return descObj.parent.posBeforeChild(descObj) }
      }, outerDeco);

      var dom = spec && spec.dom, contentDOM = spec && spec.contentDOM;
      if (node.isText) {
        if (!dom) { dom = document.createTextNode(node.text); }
        else if (dom.nodeType != 3) { throw new RangeError("Text must be rendered as a DOM text node") }
      } else if (!dom) {
        var assign;
        ((assign = dist.DOMSerializer.renderSpec(document, node.type.spec.toDOM(node)), dom = assign.dom, contentDOM = assign.contentDOM));
      }
      if (!contentDOM && !node.isText && dom.nodeName != "BR") { // Chrome gets confused by <br contenteditable=false>
        if (!dom.hasAttribute("contenteditable")) { dom.contentEditable = false; }
        if (node.type.spec.draggable) { dom.draggable = true; }
      }

      var nodeDOM = dom;
      dom = applyOuterDeco(dom, outerDeco, node);

      if (spec)
        { return descObj = new CustomNodeViewDesc(parent, node, outerDeco, innerDeco, dom, contentDOM, nodeDOM,
                                                spec, view, pos + 1) }
      else if (node.isText)
        { return new TextViewDesc(parent, node, outerDeco, innerDeco, dom, nodeDOM, view) }
      else
        { return new NodeViewDesc(parent, node, outerDeco, innerDeco, dom, contentDOM, nodeDOM, view, pos + 1) }
    };

    NodeViewDesc.prototype.parseRule = function parseRule () {
      var this$1 = this;

      // Experimental kludge to allow opt-in re-parsing of nodes
      if (this.node.type.spec.reparseInView) { return null }
      // FIXME the assumption that this can always return the current
      // attrs means that if the user somehow manages to change the
      // attrs in the dom, that won't be picked up. Not entirely sure
      // whether this is a problem
      var rule = {node: this.node.type.name, attrs: this.node.attrs};
      if (this.node.type.spec.code) { rule.preserveWhitespace = "full"; }
      if (this.contentDOM && !this.contentLost) { rule.contentElement = this.contentDOM; }
      else { rule.getContent = function () { return this$1.contentDOM ? dist.Fragment.empty : this$1.node.content; }; }
      return rule
    };

    NodeViewDesc.prototype.matchesNode = function matchesNode (node, outerDeco, innerDeco) {
      return this.dirty == NOT_DIRTY && node.eq(this.node) &&
        sameOuterDeco(outerDeco, this.outerDeco) && innerDeco.eq(this.innerDeco)
    };

    prototypeAccessors$3.size.get = function () { return this.node.nodeSize };

    prototypeAccessors$3.border.get = function () { return this.node.isLeaf ? 0 : 1 };

    // Syncs `this.children` to match `this.node.content` and the local
    // decorations, possibly introducing nesting for marks. Then, in a
    // separate step, syncs the DOM inside `this.contentDOM` to
    // `this.children`.
    NodeViewDesc.prototype.updateChildren = function updateChildren (view, pos) {
      var this$1 = this;

      var inline = this.node.inlineContent, off = pos;
      var composition = inline && view.composing && this.localCompositionNode(view, pos);
      var updater = new ViewTreeUpdater(this, composition && composition.node);
      iterDeco(this.node, this.innerDeco, function (widget, i) {
        if (widget.spec.marks)
          { updater.syncToMarks(widget.spec.marks, inline, view); }
        else if (widget.type.side >= 0)
          { updater.syncToMarks(i == this$1.node.childCount ? dist.Mark.none : this$1.node.child(i).marks, inline, view); }
        // If the next node is a desc matching this widget, reuse it,
        // otherwise insert the widget as a new view desc.
        updater.placeWidget(widget, view, off);
      }, function (child, outerDeco, innerDeco, i) {
        // Make sure the wrapping mark descs match the node's marks.
        updater.syncToMarks(child.marks, inline, view);
        // Either find an existing desc that exactly matches this node,
        // and drop the descs before it.
        updater.findNodeMatch(child, outerDeco, innerDeco, i) ||
          // Or try updating the next desc to reflect this node.
          updater.updateNextNode(child, outerDeco, innerDeco, view, i) ||
          // Or just add it as a new desc.
          updater.addNode(child, outerDeco, innerDeco, view, off);
        off += child.nodeSize;
      });
      // Drop all remaining descs after the current position.
      updater.syncToMarks(nothing, inline, view);
      if (this.node.isTextblock) { updater.addTextblockHacks(); }
      updater.destroyRest();

      // Sync the DOM if anything changed
      if (updater.changed || this.dirty == CONTENT_DIRTY) {
        // May have to protect focused DOM from being changed if a composition is active
        if (composition) { this.protectLocalComposition(view, composition); }
        this.renderChildren();
      }
    };

    NodeViewDesc.prototype.renderChildren = function renderChildren () {
      renderDescs(this.contentDOM, this.children);
      if (result.ios) { iosHacks(this.dom); }
    };

    NodeViewDesc.prototype.localCompositionNode = function localCompositionNode (view, pos) {
      // Only do something if both the selection and a focused text node
      // are inside of this node, and the node isn't already part of a
      // view that's a child of this view
      var ref = view.state.selection;
      var from = ref.from;
      var to = ref.to;
      if (!(view.state.selection instanceof dist$3.TextSelection) || from < pos || to > pos + this.node.content.size) { return }
      var sel = view.root.getSelection();
      var textNode = nearbyTextNode(sel.focusNode, sel.focusOffset);
      if (!textNode || !this.dom.contains(textNode.parentNode)) { return }

      // Find the text in the focused node in the node, stop if it's not
      // there (may have been modified through other means, in which
      // case it should overwritten)
      var text = textNode.nodeValue.replace(/\ufeff/g, "");
      var textPos = findTextInFragment(this.node.content, text, from - pos, to - pos);

      return textPos < 0 ? null : {node: textNode, pos: textPos, text: text}
    };

    NodeViewDesc.prototype.protectLocalComposition = function protectLocalComposition (view, ref) {
      var this$1 = this;
      var node = ref.node;
      var pos = ref.pos;
      var text = ref.text;

      // The node is already part of a local view desc, leave it there
      if (this.getDesc(node)) { return }

      // Create a composition view for the orphaned nodes
      var topNode = node;
      for (;; topNode = topNode.parentNode) {
        if (topNode.parentNode == this$1.contentDOM) { break }
        while (topNode.previousSibling) { topNode.parentNode.removeChild(topNode.previousSibling); }
        while (topNode.nextSibling) { topNode.parentNode.removeChild(topNode.nextSibling); }
        if (topNode.pmViewDesc) { topNode.pmViewDesc = null; }
      }
      var desc = new CompositionViewDesc(this, topNode, node, text);
      view.compositionNodes.push(desc);

      // Patch up this.children to contain the composition view
      this.children = replaceNodes(this.children, pos, pos + text.length, view, desc);
    };

    // : (Node, [Decoration], DecorationSet, EditorView) → bool
    // If this desc be updated to match the given node decoration,
    // do so and return true.
    NodeViewDesc.prototype.update = function update (node, outerDeco, innerDeco, view) {
      if (this.dirty == NODE_DIRTY ||
          !node.sameMarkup(this.node)) { return false }
      this.updateInner(node, outerDeco, innerDeco, view);
      return true
    };

    NodeViewDesc.prototype.updateInner = function updateInner (node, outerDeco, innerDeco, view) {
      this.updateOuterDeco(outerDeco);
      this.node = node;
      this.innerDeco = innerDeco;
      if (this.contentDOM) { this.updateChildren(view, this.posAtStart); }
      this.dirty = NOT_DIRTY;
    };

    NodeViewDesc.prototype.updateOuterDeco = function updateOuterDeco (outerDeco) {
      if (sameOuterDeco(outerDeco, this.outerDeco)) { return }
      var needsWrap = this.nodeDOM.nodeType != 1;
      var oldDOM = this.dom;
      this.dom = patchOuterDeco(this.dom, this.nodeDOM,
                                computeOuterDeco(this.outerDeco, this.node, needsWrap),
                                computeOuterDeco(outerDeco, this.node, needsWrap));
      if (this.dom != oldDOM) {
        oldDOM.pmViewDesc = null;
        this.dom.pmViewDesc = this;
      }
      this.outerDeco = outerDeco;
    };

    // Mark this node as being the selected node.
    NodeViewDesc.prototype.selectNode = function selectNode () {
      this.nodeDOM.classList.add("ProseMirror-selectednode");
      if (this.contentDOM || !this.node.type.spec.draggable) { this.dom.draggable = true; }
    };

    // Remove selected node marking from this node.
    NodeViewDesc.prototype.deselectNode = function deselectNode () {
      this.nodeDOM.classList.remove("ProseMirror-selectednode");
      if (this.contentDOM || !this.node.type.spec.draggable) { this.dom.draggable = false; }
    };

    Object.defineProperties( NodeViewDesc.prototype, prototypeAccessors$3 );

    return NodeViewDesc;
  }(ViewDesc));

  // Create a view desc for the top-level document node, to be exported
  // and used by the view class.
  function docViewDesc(doc, outerDeco, innerDeco, dom, view) {
    applyOuterDeco(dom, outerDeco, doc);
    return new NodeViewDesc(null, doc, outerDeco, innerDeco, dom, dom, dom, view, 0)
  }

  var TextViewDesc = (function (NodeViewDesc) {
    function TextViewDesc(parent, node, outerDeco, innerDeco, dom, nodeDOM, view) {
      NodeViewDesc.call(this, parent, node, outerDeco, innerDeco, dom, null, nodeDOM, view);
    }

    if ( NodeViewDesc ) TextViewDesc.__proto__ = NodeViewDesc;
    TextViewDesc.prototype = Object.create( NodeViewDesc && NodeViewDesc.prototype );
    TextViewDesc.prototype.constructor = TextViewDesc;

    TextViewDesc.prototype.parseRule = function parseRule () {
      var parent = this.nodeDOM.parentNode;
      return parent ? {skip: parent} : {ignore: true}
    };

    TextViewDesc.prototype.update = function update (node, outerDeco) {
      if (this.dirty == NODE_DIRTY || (this.dirty != NOT_DIRTY && !this.inParent()) ||
          !node.sameMarkup(this.node)) { return false }
      this.updateOuterDeco(outerDeco);
      if ((this.dirty != NOT_DIRTY || node.text != this.node.text) && node.text != this.nodeDOM.nodeValue)
        { this.nodeDOM.nodeValue = node.text; }
      this.node = node;
      this.dirty = NOT_DIRTY;
      return true
    };

    TextViewDesc.prototype.inParent = function inParent () {
      var parentDOM = this.parent.contentDOM;
      for (var n = this.nodeDOM; n; n = n.parentNode) { if (n == parentDOM) { return true } }
      return false
    };

    TextViewDesc.prototype.domFromPos = function domFromPos (pos) {
      return {node: this.nodeDOM, offset: pos}
    };

    TextViewDesc.prototype.localPosFromDOM = function localPosFromDOM (dom, offset, bias) {
      if (dom == this.nodeDOM) { return this.posAtStart + Math.min(offset, this.node.text.length) }
      return NodeViewDesc.prototype.localPosFromDOM.call(this, dom, offset, bias)
    };

    TextViewDesc.prototype.ignoreMutation = function ignoreMutation (mutation) {
      return mutation.type != "characterData"
    };

    TextViewDesc.prototype.slice = function slice (from, to, view) {
      var node = this.node.cut(from, to), dom = document.createTextNode(node.text);
      return new TextViewDesc(this.parent, node, this.outerDeco, this.innerDeco, dom, dom, view)
    };

    return TextViewDesc;
  }(NodeViewDesc));

  // A dummy desc used to tag trailing BR or span nodes created to work
  // around contentEditable terribleness.
  var BRHackViewDesc = (function (ViewDesc) {
    function BRHackViewDesc () {
      ViewDesc.apply(this, arguments);
    }

    if ( ViewDesc ) BRHackViewDesc.__proto__ = ViewDesc;
    BRHackViewDesc.prototype = Object.create( ViewDesc && ViewDesc.prototype );
    BRHackViewDesc.prototype.constructor = BRHackViewDesc;

    BRHackViewDesc.prototype.parseRule = function parseRule () { return {ignore: true} };
    BRHackViewDesc.prototype.matchesHack = function matchesHack () { return this.dirty == NOT_DIRTY };

    return BRHackViewDesc;
  }(ViewDesc));

  // A separate subclass is used for customized node views, so that the
  // extra checks only have to be made for nodes that are actually
  // customized.
  var CustomNodeViewDesc = (function (NodeViewDesc) {
    function CustomNodeViewDesc(parent, node, outerDeco, innerDeco, dom, contentDOM, nodeDOM, spec, view, pos) {
      NodeViewDesc.call(this, parent, node, outerDeco, innerDeco, dom, contentDOM, nodeDOM, view, pos);
      this.spec = spec;
    }

    if ( NodeViewDesc ) CustomNodeViewDesc.__proto__ = NodeViewDesc;
    CustomNodeViewDesc.prototype = Object.create( NodeViewDesc && NodeViewDesc.prototype );
    CustomNodeViewDesc.prototype.constructor = CustomNodeViewDesc;

    // A custom `update` method gets to decide whether the update goes
    // through. If it does, and there's a `contentDOM` node, our logic
    // updates the children.
    CustomNodeViewDesc.prototype.update = function update (node, outerDeco, innerDeco, view) {
      if (this.dirty == NODE_DIRTY) { return false }
      if (this.spec.update) {
        var result$$1 = this.spec.update(node, outerDeco);
        if (result$$1) { this.updateInner(node, outerDeco, innerDeco, view); }
        return result$$1
      } else if (!this.contentDOM && !node.isLeaf) {
        return false
      } else {
        return NodeViewDesc.prototype.update.call(this, node, outerDeco, innerDeco, view)
      }
    };

    CustomNodeViewDesc.prototype.selectNode = function selectNode () {
      this.spec.selectNode ? this.spec.selectNode() : NodeViewDesc.prototype.selectNode.call(this);
    };

    CustomNodeViewDesc.prototype.deselectNode = function deselectNode () {
      this.spec.deselectNode ? this.spec.deselectNode() : NodeViewDesc.prototype.deselectNode.call(this);
    };

    CustomNodeViewDesc.prototype.setSelection = function setSelection (anchor, head, root, force) {
      this.spec.setSelection ? this.spec.setSelection(anchor, head, root)
        : NodeViewDesc.prototype.setSelection.call(this, anchor, head, root, force);
    };

    CustomNodeViewDesc.prototype.destroy = function destroy () {
      if (this.spec.destroy) { this.spec.destroy(); }
      NodeViewDesc.prototype.destroy.call(this);
    };

    CustomNodeViewDesc.prototype.stopEvent = function stopEvent (event) {
      return this.spec.stopEvent ? this.spec.stopEvent(event) : false
    };

    CustomNodeViewDesc.prototype.ignoreMutation = function ignoreMutation (mutation) {
      return this.spec.ignoreMutation ? this.spec.ignoreMutation(mutation) : NodeViewDesc.prototype.ignoreMutation.call(this, mutation)
    };

    return CustomNodeViewDesc;
  }(NodeViewDesc));

  // : (dom.Node, [ViewDesc])
  // Sync the content of the given DOM node with the nodes associated
  // with the given array of view descs, recursing into mark descs
  // because this should sync the subtree for a whole node at a time.
  function renderDescs(parentDOM, descs) {
    var dom = parentDOM.firstChild;
    for (var i = 0; i < descs.length; i++) {
      var desc = descs[i], childDOM = desc.dom;
      if (childDOM.parentNode == parentDOM) {
        while (childDOM != dom) { dom = rm(dom); }
        dom = dom.nextSibling;
      } else {
        parentDOM.insertBefore(childDOM, dom);
      }
      if (desc instanceof MarkViewDesc) {
        var pos = dom ? dom.previousSibling : parentDOM.lastChild;
        renderDescs(desc.contentDOM, desc.children);
        dom = pos ? pos.nextSibling : parentDOM.firstChild;
      }
    }
    while (dom) { dom = rm(dom); }
  }

  function OuterDecoLevel(nodeName) {
    if (nodeName) { this.nodeName = nodeName; }
  }
  OuterDecoLevel.prototype = Object.create(null);

  var noDeco = [new OuterDecoLevel];

  function computeOuterDeco(outerDeco, node, needsWrap) {
    if (outerDeco.length == 0) { return noDeco }

    var top = needsWrap ? noDeco[0] : new OuterDecoLevel, result$$1 = [top];

    for (var i = 0; i < outerDeco.length; i++) {
      var attrs = outerDeco[i].type.attrs, cur = top;
      if (!attrs) { continue }
      if (attrs.nodeName)
        { result$$1.push(cur = new OuterDecoLevel(attrs.nodeName)); }

      for (var name in attrs) {
        var val = attrs[name];
        if (val == null) { continue }
        if (needsWrap && result$$1.length == 1)
          { result$$1.push(cur = top = new OuterDecoLevel(node.isInline ? "span" : "div")); }
        if (name == "class") { cur.class = (cur.class ? cur.class + " " : "") + val; }
        else if (name == "style") { cur.style = (cur.style ? cur.style + ";" : "") + val; }
        else if (name != "nodeName") { cur[name] = val; }
      }
    }

    return result$$1
  }

  function patchOuterDeco(outerDOM, nodeDOM, prevComputed, curComputed) {
    // Shortcut for trivial case
    if (prevComputed == noDeco && curComputed == noDeco) { return nodeDOM }

    var curDOM = nodeDOM;
    for (var i = 0; i < curComputed.length; i++) {
      var deco = curComputed[i], prev = prevComputed[i];
      if (i) {
        var parent = (void 0);
        if (prev && prev.nodeName == deco.nodeName && curDOM != outerDOM &&
            (parent = nodeDOM.parentNode) && parent.tagName.toLowerCase() == deco.nodeName) {
          curDOM = parent;
        } else {
          parent = document.createElement(deco.nodeName);
          parent.appendChild(curDOM);
          curDOM = parent;
        }
      }
      patchAttributes(curDOM, prev || noDeco[0], deco);
    }
    return curDOM
  }

  function patchAttributes(dom, prev, cur) {
    for (var name in prev)
      { if (name != "class" && name != "style" && name != "nodeName" && !(name in cur))
        { dom.removeAttribute(name); } }
    for (var name$1 in cur)
      { if (name$1 != "class" && name$1 != "style" && name$1 != "nodeName" && cur[name$1] != prev[name$1])
        { dom.setAttribute(name$1, cur[name$1]); } }
    if (prev.class != cur.class) {
      var prevList = prev.class ? prev.class.split(" ") : nothing;
      var curList = cur.class ? cur.class.split(" ") : nothing;
      for (var i = 0; i < prevList.length; i++) { if (curList.indexOf(prevList[i]) == -1)
        { dom.classList.remove(prevList[i]); } }
      for (var i$1 = 0; i$1 < curList.length; i$1++) { if (prevList.indexOf(curList[i$1]) == -1)
        { dom.classList.add(curList[i$1]); } }
    }
    if (prev.style != cur.style) {
      if (prev.style) {
        var prop = /\s*([\w\-\xa1-\uffff]+)\s*:(?:"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\(.*?\)|[^;])*/g, m;
        while (m = prop.exec(prev.style))
          { dom.style[m[1].toLowerCase()] = ""; }
      }
      if (cur.style)
        { dom.style.cssText += cur.style; }
    }
  }

  function applyOuterDeco(dom, deco, node) {
    return patchOuterDeco(dom, dom, noDeco, computeOuterDeco(deco, node, dom.nodeType != 1))
  }

  // : ([Decoration], [Decoration]) → bool
  function sameOuterDeco(a, b) {
    if (a.length != b.length) { return false }
    for (var i = 0; i < a.length; i++) { if (!a[i].type.eq(b[i].type)) { return false } }
    return true
  }

  // Remove a DOM node and return its next sibling.
  function rm(dom) {
    var next = dom.nextSibling;
    dom.parentNode.removeChild(dom);
    return next
  }

  // Helper class for incrementally updating a tree of mark descs and
  // the widget and node descs inside of them.
  var ViewTreeUpdater = function ViewTreeUpdater(top, lockedNode) {
    this.top = top;
    this.lock = lockedNode;
    // Index into `this.top`'s child array, represents the current
    // update position.
    this.index = 0;
    // When entering a mark, the current top and index are pushed
    // onto this.
    this.stack = [];
    // Tracks whether anything was changed
    this.changed = false;

    var pre = preMatch(top.node.content, top.children);
    this.preMatched = pre.nodes;
    this.preMatchOffset = pre.offset;
  };

  ViewTreeUpdater.prototype.getPreMatch = function getPreMatch (index) {
    return index >= this.preMatchOffset ? this.preMatched[index - this.preMatchOffset] : null
  };

  // Destroy and remove the children between the given indices in
  // `this.top`.
  ViewTreeUpdater.prototype.destroyBetween = function destroyBetween (start, end) {
      var this$1 = this;

    if (start == end) { return }
    for (var i = start; i < end; i++) { this$1.top.children[i].destroy(); }
    this.top.children.splice(start, end - start);
    this.changed = true;
  };

  // Destroy all remaining children in `this.top`.
  ViewTreeUpdater.prototype.destroyRest = function destroyRest () {
    this.destroyBetween(this.index, this.top.children.length);
  };

  // : ([Mark], EditorView)
  // Sync the current stack of mark descs with the given array of
  // marks, reusing existing mark descs when possible.
  ViewTreeUpdater.prototype.syncToMarks = function syncToMarks (marks, inline, view) {
      var this$1 = this;

    var keep = 0, depth = this.stack.length >> 1;
    var maxKeep = Math.min(depth, marks.length);
    while (keep < maxKeep &&
           (keep == depth - 1 ? this.top : this.stack[(keep + 1) << 1]).matchesMark(marks[keep]) && marks[keep].type.spec.spanning !== false)
      { keep++; }

    while (keep < depth) {
      this$1.destroyRest();
      this$1.top.dirty = NOT_DIRTY;
      this$1.index = this$1.stack.pop();
      this$1.top = this$1.stack.pop();
      depth--;
    }
    while (depth < marks.length) {
      this$1.stack.push(this$1.top, this$1.index + 1);
      var found = -1;
      for (var i = this.index; i < Math.min(this.index + 3, this.top.children.length); i++) {
        if (this$1.top.children[i].matchesMark(marks[depth])) { found = i; break }
      }
      if (found > -1) {
        if (found > this$1.index) {
          this$1.changed = true;
          this$1.top.children.splice(this$1.index, found - this$1.index);
        }
        this$1.top = this$1.top.children[this$1.index];
      } else {
        var markDesc = MarkViewDesc.create(this$1.top, marks[depth], inline, view);
        this$1.top.children.splice(this$1.index, 0, markDesc);
        this$1.top = markDesc;
        this$1.changed = true;
      }
      this$1.index = 0;
      depth++;
    }
  };

  // : (Node, [Decoration], DecorationSet) → bool
  // Try to find a node desc matching the given data. Skip over it and
  // return true when successful.
  ViewTreeUpdater.prototype.findNodeMatch = function findNodeMatch (node, outerDeco, innerDeco, index) {
      var this$1 = this;

    var found = -1, preMatch = index < 0 ? undefined : this.getPreMatch(index), children = this.top.children;
    if (preMatch && preMatch.matchesNode(node, outerDeco, innerDeco)) {
      found = children.indexOf(preMatch);
    } else {
      for (var i = this.index, e = Math.min(children.length, i + 5); i < e; i++) {
        var child = children[i];
        if (child.matchesNode(node, outerDeco, innerDeco) && this$1.preMatched.indexOf(child) < 0) {
          found = i;
          break
        }
      }
    }
    if (found < 0) { return false }
    this.destroyBetween(this.index, found);
    this.index++;
    return true
  };

  // : (Node, [Decoration], DecorationSet, EditorView, Fragment, number) → bool
  // Try to update the next node, if any, to the given data. Checks
  // pre-matches to avoid overwriting nodes that could still be used.
  ViewTreeUpdater.prototype.updateNextNode = function updateNextNode (node, outerDeco, innerDeco, view, index) {
    if (this.index == this.top.children.length) { return false }
    var next = this.top.children[this.index];
    if (next instanceof NodeViewDesc) {
      var preMatch = this.preMatched.indexOf(next);
      if (preMatch > -1 && preMatch + this.preMatchOffset != index) { return false }
      var nextDOM = next.dom;

      // Can't update if nextDOM is or contains this.lock, except if
      // it's a text node whose content already matches the new text
      // and whose decorations match the new ones.
      var locked = this.lock && (nextDOM == this.lock || nextDOM.nodeType == 1 && nextDOM.contains(this.lock.parentNode)) &&
          !(node.isText && next.node && next.node.isText && next.nodeDOM.nodeValue == node.text &&
            next.dirty != NODE_DIRTY && sameOuterDeco(outerDeco, next.outerDeco));
      if (!locked && next.update(node, outerDeco, innerDeco, view)) {
        if (next.dom != nextDOM) { this.changed = true; }
        this.index++;
        return true
      }
    }
    return false
  };

  // : (Node, [Decoration], DecorationSet, EditorView)
  // Insert the node as a newly created node desc.
  ViewTreeUpdater.prototype.addNode = function addNode (node, outerDeco, innerDeco, view, pos) {
    this.top.children.splice(this.index++, 0, NodeViewDesc.create(this.top, node, outerDeco, innerDeco, view, pos));
    this.changed = true;
  };

  ViewTreeUpdater.prototype.placeWidget = function placeWidget (widget, view, pos) {
    if (this.index < this.top.children.length && this.top.children[this.index].matchesWidget(widget)) {
      this.index++;
    } else {
      var desc = new (widget.spec.isCursorWrapper ? CursorWrapperDesc : WidgetViewDesc)(this.top, widget, view, pos);
      this.top.children.splice(this.index++, 0, desc);
      this.changed = true;
    }
  };

  ViewTreeUpdater.prototype.placeComposition = function placeComposition (view, desc) {
    this.syncToMarks(nothing, true, view);
    if (this.top.children[this.index] == desc) { this.index++; }
    else { this.top.children.splice(this.index++, 0, desc); this.changed = true; }
  };

  // Make sure a textblock looks and behaves correctly in
  // contentEditable.
  ViewTreeUpdater.prototype.addTextblockHacks = function addTextblockHacks () {
    var lastChild = this.top.children[this.index - 1];
    while (lastChild instanceof MarkViewDesc) { lastChild = lastChild.children[lastChild.children.length - 1]; }

    if (!lastChild || // Empty textblock
        !(lastChild instanceof TextViewDesc) ||
        /\n$/.test(lastChild.node.text)) {
      if (this.index < this.top.children.length && this.top.children[this.index].matchesHack()) {
        this.index++;
      } else {
        var dom = document.createElement("br");
        this.top.children.splice(this.index++, 0, new BRHackViewDesc(this.top, nothing, dom, null));
        this.changed = true;
      }
    }
  };

  // : (Fragment, [ViewDesc]) → [ViewDesc]
  // Iterate from the end of the fragment and array of descs to find
  // directly matching ones, in order to avoid overeagerly reusing
  // those for other nodes. Returns an array whose positions correspond
  // to node positions in the fragment, and whose elements are either
  // descs matched to the child at that index, or empty.
  function preMatch(frag, descs) {
    var result$$1 = [], end = frag.childCount;
    for (var i = descs.length - 1; end > 0 && i >= 0; i--) {
      var desc = descs[i], node = desc.node;
      if (!node) { continue }
      if (node != frag.child(end - 1)) { break }
      result$$1.push(desc);
      --end;
    }
    return {nodes: result$$1.reverse(), offset: end}
  }

  function compareSide(a, b) { return a.type.side - b.type.side }

  // : (ViewDesc, DecorationSet, (Decoration, number), (Node, [Decoration], DecorationSet, number))
  // This function abstracts iterating over the nodes and decorations in
  // a fragment. Calls `onNode` for each node, with its local and child
  // decorations. Splits text nodes when there is a decoration starting
  // or ending inside of them. Calls `onWidget` for each widget.
  function iterDeco(parent, deco, onWidget, onNode) {
    var locals = deco.locals(parent), offset = 0;
    // Simple, cheap variant for when there are no local decorations
    if (locals.length == 0) {
      for (var i = 0; i < parent.childCount; i++) {
        var child = parent.child(i);
        onNode(child, locals, deco.forChild(offset, child), i);
        offset += child.nodeSize;
      }
      return
    }

    var decoIndex = 0, active = [], restNode = null;
    for (var parentIndex = 0;;) {
      if (decoIndex < locals.length && locals[decoIndex].to == offset) {
        var widget = locals[decoIndex++], widgets = (void 0);
        while (decoIndex < locals.length && locals[decoIndex].to == offset)
          { (widgets || (widgets = [widget])).push(locals[decoIndex++]); }
        if (widgets) {
          widgets.sort(compareSide);
          for (var i$1 = 0; i$1 < widgets.length; i$1++) { onWidget(widgets[i$1], parentIndex); }
        } else {
          onWidget(widget, parentIndex);
        }
      }

      var child$1 = (void 0), index = (void 0);
      if (restNode) {
        index = -1;
        child$1 = restNode;
        restNode = null;
      } else if (parentIndex < parent.childCount) {
        index = parentIndex;
        child$1 = parent.child(parentIndex++);
      } else {
        break
      }

      for (var i$2 = 0; i$2 < active.length; i$2++) { if (active[i$2].to <= offset) { active.splice(i$2--, 1); } }
      while (decoIndex < locals.length && locals[decoIndex].from == offset) { active.push(locals[decoIndex++]); }

      var end = offset + child$1.nodeSize;
      if (child$1.isText) {
        var cutAt = end;
        if (decoIndex < locals.length && locals[decoIndex].from < cutAt) { cutAt = locals[decoIndex].from; }
        for (var i$3 = 0; i$3 < active.length; i$3++) { if (active[i$3].to < cutAt) { cutAt = active[i$3].to; } }
        if (cutAt < end) {
          restNode = child$1.cut(cutAt - offset);
          child$1 = child$1.cut(0, cutAt - offset);
          end = cutAt;
          index = -1;
        }
      }

      onNode(child$1, active.length ? active.slice() : nothing, deco.forChild(offset, child$1), index);
      offset = end;
    }
  }

  // List markers in Mobile Safari will mysteriously disappear
  // sometimes. This works around that.
  function iosHacks(dom) {
    if (dom.nodeName == "UL" || dom.nodeName == "OL") {
      var oldCSS = dom.style.cssText;
      dom.style.cssText = oldCSS + "; list-style: square !important";
      window.getComputedStyle(dom).listStyle;
      dom.style.cssText = oldCSS;
    }
  }

  function nearbyTextNode(node, offset) {
    for (;;) {
      if (node.nodeType == 3) { return node }
      if (node.nodeType == 1 && offset > 0) {
        node = node.childNodes[offset - 1];
        offset = nodeSize(node);
      } else if (node.nodeType == 1 && offset < node.childNodes.length) {
        node = node.childNodes[offset];
        offset = 0;
      } else {
        return null
      }
    }
  }

  // Find a piece of text in an inline fragment, overlapping from-to
  function findTextInFragment(frag, text, from, to) {
    for (var str = "", i = 0, childPos = 0; i < frag.childCount; i++) {
      var child = frag.child(i), end = childPos + child.nodeSize;
      if (child.isText) {
        str += child.text;
        if (end >= to) {
          var strStart = end - str.length, found = str.lastIndexOf(text);
          while (found > -1 && strStart + found > from) { found = str.lastIndexOf(text, found - 1); }
          if (found > -1 && strStart + found + text.length >= to) {
            return strStart + found
          } else if (end > to - text.length) {
            break
          }
        }
      } else {
        str = "";
      }
      childPos = end;
    }
    return -1
  }

  // Replace range from-to in an array of view descs with replacement
  // (may be null to just delete). This goes very much against the grain
  // of the rest of this code, which tends to create nodes with the
  // right shape in one go, rather than messing with them after
  // creation, but is necessary in the composition hack.
  function replaceNodes(nodes, from, to, view, replacement) {
    var result$$1 = [];
    for (var i = 0, off = 0; i < nodes.length; i++) {
      var child = nodes[i], start = off, end = off += child.size;
      if (start >= to || end <= from) {
        result$$1.push(child);
      } else {
        if (start < from) { result$$1.push(child.slice(0, from - start, view)); }
        if (replacement) {
          result$$1.push(replacement);
          replacement = null;
        }
        if (end > to) { result$$1.push(child.slice(to - start, child.size, view)); }
      }
    }
    return result$$1
  }

  function withoutZeroWidthSpaces(dom) {
    var clone = dom.cloneNode(true);
    function scan(node) {
      if (node.nodeType == 1)
        { for (var child = node.firstChild; child; child = child.nextSibling) { scan(child); } }
      else if (node.nodeType == 3)
        { node.nodeValue = node.nodeValue.replace(/\ufeff/g, ""); }
    }
    scan(clone);
    return clone
  }

  function moveSelectionBlock(state, dir) {
    var ref = state.selection;
    var $anchor = ref.$anchor;
    var $head = ref.$head;
    var $side = dir > 0 ? $anchor.max($head) : $anchor.min($head);
    var $start = !$side.parent.inlineContent ? $side : $side.depth ? state.doc.resolve(dir > 0 ? $side.after() : $side.before()) : null;
    return $start && dist$3.Selection.findFrom($start, dir)
  }

  function apply(view, sel) {
    view.dispatch(view.state.tr.setSelection(sel).scrollIntoView());
    return true
  }

  function selectHorizontally(view, dir, mods) {
    var sel = view.state.selection;
    if (sel instanceof dist$3.TextSelection) {
      if (!sel.empty || mods.indexOf("s") > -1) {
        return false
      } else if (view.endOfTextblock(dir > 0 ? "right" : "left")) {
        var next = moveSelectionBlock(view.state, dir);
        if (next && (next instanceof dist$3.NodeSelection)) { return apply(view, next) }
        return false
      } else {
        var $head = sel.$head, node = $head.textOffset ? null : dir < 0 ? $head.nodeBefore : $head.nodeAfter, desc;
        if (!node || node.isText) { return false }
        var nodePos = dir < 0 ? $head.pos - node.nodeSize : $head.pos;
        if (!(node.isAtom || (desc = view.docView.descAt(nodePos)) && !desc.contentDOM)) { return false }
        if (dist$3.NodeSelection.isSelectable(node)) {
          return apply(view, new dist$3.NodeSelection(dir < 0 ? view.state.doc.resolve($head.pos - node.nodeSize) : $head))
        } else if (result.webkit) {
          // Chrome and Safari will introduce extra pointless cursor
          // positions around inline uneditable nodes, so we have to
          // take over and move the cursor past them (#937)
          return apply(view, new dist$3.TextSelection(view.state.doc.resolve(dir < 0 ? nodePos : nodePos + node.nodeSize)))
        } else {
          return false
        }
      }
    } else if (sel instanceof dist$3.NodeSelection && sel.node.isInline) {
      return apply(view, new dist$3.TextSelection(dir > 0 ? sel.$to : sel.$from))
    } else {
      var next$1 = moveSelectionBlock(view.state, dir);
      if (next$1) { return apply(view, next$1) }
      return false
    }
  }

  function nodeLen(node) {
    return node.nodeType == 3 ? node.nodeValue.length : node.childNodes.length
  }

  function isIgnorable(dom) {
    var desc = dom.pmViewDesc;
    return desc && desc.size == 0 && (dom.nextSibling || dom.nodeName != "BR")
  }

  // Make sure the cursor isn't directly after one or more ignored
  // nodes, which will confuse the browser's cursor motion logic.
  function skipIgnoredNodesLeft(view) {
    var sel = view.root.getSelection();
    var node = sel.focusNode, offset = sel.focusOffset;
    if (!node) { return }
    var moveNode, moveOffset, force = false;
    // Gecko will do odd things when the selection is directly in front
    // of a non-editable node, so in that case, move it into the next
    // node if possible. Issue prosemirror/prosemirror#832.
    if (result.gecko && node.nodeType == 1 && offset < nodeLen(node) && isIgnorable(node.childNodes[offset])) { force = true; }
    for (;;) {
      if (offset > 0) {
        if (node.nodeType != 1) {
          if (node.nodeType == 3 && node.nodeValue.charAt(offset - 1) == "\ufeff") {
            // IE11's cursor will still be stuck when placed at the
            // beginning of the cursor wrapper text node (#807)
            if (result.ie && result.ie_version <= 11) { force = true; }
            moveNode = node;
            moveOffset = --offset;
          } else { break }
        } else {
          var before = node.childNodes[offset - 1];
          if (isIgnorable(before)) {
            moveNode = node;
            moveOffset = --offset;
          } else if (before.nodeType == 3) {
            node = before;
            offset = node.nodeValue.length;
          } else { break }
        }
      } else if (isBlockNode(node)) {
        break
      } else {
        var prev = node.previousSibling;
        while (prev && isIgnorable(prev)) {
          moveNode = node.parentNode;
          moveOffset = domIndex(prev);
          prev = prev.previousSibling;
        }
        if (!prev) {
          node = node.parentNode;
          if (node == view.dom) { break }
          offset = 0;
        } else {
          node = prev;
          offset = nodeLen(node);
        }
      }
    }
    if (force) { setSelFocus(view, sel, node, offset); }
    else if (moveNode) { setSelFocus(view, sel, moveNode, moveOffset); }
  }

  // Make sure the cursor isn't directly before one or more ignored
  // nodes.
  function skipIgnoredNodesRight(view) {
    var sel = view.root.getSelection();
    var node = sel.focusNode, offset = sel.focusOffset;
    if (!node) { return }
    var len = nodeLen(node);
    var moveNode, moveOffset;
    for (;;) {
      if (offset < len) {
        if (node.nodeType != 1) { break }
        var after = node.childNodes[offset];
        if (isIgnorable(after)) {
          moveNode = node;
          moveOffset = ++offset;
        }
        else { break }
      } else if (isBlockNode(node)) {
        break
      } else {
        var next = node.nextSibling;
        while (next && isIgnorable(next)) {
          moveNode = next.parentNode;
          moveOffset = domIndex(next) + 1;
          next = next.nextSibling;
        }
        if (!next) {
          node = node.parentNode;
          if (node == view.dom) { break }
          offset = len = 0;
        } else {
          node = next;
          offset = 0;
          len = nodeLen(node);
        }
      }
    }
    if (moveNode) { setSelFocus(view, sel, moveNode, moveOffset); }
  }

  function isBlockNode(dom) {
    var desc = dom.pmViewDesc;
    return desc && desc.node && desc.node.isBlock
  }

  function setSelFocus(view, sel, node, offset) {
    if (selectionCollapsed(sel)) {
      var range = document.createRange();
      range.setEnd(node, offset);
      range.setStart(node, offset);
      sel.removeAllRanges();
      sel.addRange(range);
    } else if (sel.extend) {
      sel.extend(node, offset);
    }
    view.domObserver.setCurSelection();
  }

  // : (EditorState, number)
  // Check whether vertical selection motion would involve node
  // selections. If so, apply it (if not, the result is left to the
  // browser)
  function selectVertically(view, dir, mods) {
    var sel = view.state.selection;
    if (sel instanceof dist$3.TextSelection && !sel.empty || mods.indexOf("s") > -1) { return false }
    var $from = sel.$from;
    var $to = sel.$to;

    if (!$from.parent.inlineContent || view.endOfTextblock(dir < 0 ? "up" : "down")) {
      var next = moveSelectionBlock(view.state, dir);
      if (next && (next instanceof dist$3.NodeSelection))
        { return apply(view, next) }
    }
    if (!$from.parent.inlineContent) {
      var beyond = dist$3.Selection.findFrom(dir < 0 ? $from : $to, dir);
      return beyond ? apply(view, beyond) : true
    }
    return false
  }

  function stopNativeHorizontalDelete(view, dir) {
    if (!(view.state.selection instanceof dist$3.TextSelection)) { return true }
    var ref = view.state.selection;
    var $head = ref.$head;
    var $anchor = ref.$anchor;
    var empty = ref.empty;
    if (!$head.sameParent($anchor)) { return true }
    if (!empty) { return false }
    if (view.endOfTextblock(dir > 0 ? "forward" : "backward")) { return true }
    var nextNode = !$head.textOffset && (dir < 0 ? $head.nodeBefore : $head.nodeAfter);
    if (nextNode && !nextNode.isText) {
      var tr = view.state.tr;
      if (dir < 0) { tr.delete($head.pos - nextNode.nodeSize, $head.pos); }
      else { tr.delete($head.pos, $head.pos + nextNode.nodeSize); }
      view.dispatch(tr);
      return true
    }
    return false
  }

  function switchEditable(view, node, state) {
    view.domObserver.stop();
    node.contentEditable = state;
    view.domObserver.start();
  }

  // Issue #867 / https://bugs.chromium.org/p/chromium/issues/detail?id=903821
  // In which Chrome does really wrong things when the down arrow is
  // pressed when the cursor is directly at the start of a textblock and
  // has an uneditable node after it
  function chromeDownArrowBug(view) {
    if (!result.chrome || view.state.selection.$head.parentOffset > 0) { return }
    var ref = view.root.getSelection();
    var focusNode = ref.focusNode;
    var focusOffset = ref.focusOffset;
    if (focusNode && focusNode.nodeType == 1 && focusOffset == 0 &&
        focusNode.firstChild && focusNode.firstChild.contentEditable == "false") {
      var child = focusNode.firstChild;
      switchEditable(view, child, true);
      setTimeout(function () { return switchEditable(view, child, false); }, 20);
    }
  }

  // A backdrop key mapping used to make sure we always suppress keys
  // that have a dangerous default effect, even if the commands they are
  // bound to return false, and to make sure that cursor-motion keys
  // find a cursor (as opposed to a node selection) when pressed. For
  // cursor-motion keys, the code in the handlers also takes care of
  // block selections.

  function getMods(event) {
    var result$$1 = "";
    if (event.ctrlKey) { result$$1 += "c"; }
    if (event.metaKey) { result$$1 += "m"; }
    if (event.altKey) { result$$1 += "a"; }
    if (event.shiftKey) { result$$1 += "s"; }
    return result$$1
  }

  function captureKeyDown(view, event) {
    var code = event.keyCode, mods = getMods(event);
    if (code == 8 || (result.mac && code == 72 && mods == "c")) { // Backspace, Ctrl-h on Mac
      return stopNativeHorizontalDelete(view, -1) || skipIgnoredNodesLeft(view)
    } else if (code == 46 || (result.mac && code == 68 && mods == "c")) { // Delete, Ctrl-d on Mac
      return stopNativeHorizontalDelete(view, 1) || skipIgnoredNodesRight(view)
    } else if (code == 13 || code == 27) { // Enter, Esc
      return true
    } else if (code == 37) { // Left arrow
      return selectHorizontally(view, -1, mods) || skipIgnoredNodesLeft(view)
    } else if (code == 39) { // Right arrow
      return selectHorizontally(view, 1, mods) || skipIgnoredNodesRight(view)
    } else if (code == 38) { // Up arrow
      return selectVertically(view, -1, mods) || skipIgnoredNodesLeft(view)
    } else if (code == 40) { // Down arrow
      return chromeDownArrowBug(view) || selectVertically(view, 1, mods) || skipIgnoredNodesRight(view)
    } else if (mods == (result.mac ? "m" : "c") &&
               (code == 66 || code == 73 || code == 89 || code == 90)) { // Mod-[biyz]
      return true
    }
    return false
  }

  function selectionFromDOM(view, origin) {
    var domSel = view.root.getSelection(), doc = view.state.doc;
    var nearestDesc = view.docView.nearestDesc(domSel.focusNode), inWidget = nearestDesc && nearestDesc.size == 0;
    var head = view.docView.posFromDOM(domSel.focusNode, domSel.focusOffset);
    var $head = doc.resolve(head), $anchor, selection;
    if (selectionCollapsed(domSel)) {
      $anchor = $head;
      while (nearestDesc && !nearestDesc.node) { nearestDesc = nearestDesc.parent; }
      if (nearestDesc && nearestDesc.node.isAtom && dist$3.NodeSelection.isSelectable(nearestDesc.node) && nearestDesc.parent) {
        var pos = nearestDesc.posBefore;
        selection = new dist$3.NodeSelection(head == pos ? $head : doc.resolve(pos));
      }
    } else {
      $anchor = doc.resolve(view.docView.posFromDOM(domSel.anchorNode, domSel.anchorOffset));
    }

    if (!selection) {
      var bias = origin == "pointer" || (view.state.selection.head < $head.pos && !inWidget) ? 1 : -1;
      selection = selectionBetween(view, $anchor, $head, bias);
    }
    return selection
  }

  function selectionToDOM(view, takeFocus, force) {
    var sel = view.state.selection;
    syncNodeSelection(view, sel);

    if (view.editable && !view.hasFocus()) {
      if (!takeFocus) { return }
      // See https://bugzilla.mozilla.org/show_bug.cgi?id=921444
      if (result.gecko && result.gecko_version <= 55) {
        view.domObserver.disconnectSelection();
        view.dom.focus();
        view.domObserver.connectSelection();
      }
    } else if (!view.editable && !hasSelection(view) && !takeFocus) {
      return
    }

    view.domObserver.disconnectSelection();

    if (view.cursorWrapper) {
      selectCursorWrapper(view);
    } else {
      var anchor = sel.anchor;
      var head = sel.head;
      var resetEditableFrom, resetEditableTo;
      if (brokenSelectBetweenUneditable && !(sel instanceof dist$3.TextSelection)) {
        if (!sel.$from.parent.inlineContent)
          { resetEditableFrom = temporarilyEditableNear(view, sel.from); }
        if (!sel.empty && !sel.$from.parent.inlineContent)
          { resetEditableTo = temporarilyEditableNear(view, sel.to); }
      }
      view.docView.setSelection(anchor, head, view.root, force);
      if (brokenSelectBetweenUneditable) {
        if (resetEditableFrom) { resetEditableFrom.contentEditable = "false"; }
        if (resetEditableTo) { resetEditableTo.contentEditable = "false"; }
      }
      if (sel.visible) {
        view.dom.classList.remove("ProseMirror-hideselection");
      } else if (anchor != head) {
        view.dom.classList.add("ProseMirror-hideselection");
        if ("onselectionchange" in document) { removeClassOnSelectionChange(view); }
      }
    }

    view.domObserver.setCurSelection();
    view.domObserver.connectSelection();
  }

  // Kludge to work around Webkit not allowing a selection to start/end
  // between non-editable block nodes. We briefly make something
  // editable, set the selection, then set it uneditable again.

  var brokenSelectBetweenUneditable = result.safari || result.chrome && result.chrome_version < 63;

  function temporarilyEditableNear(view, pos) {
    var ref = view.docView.domFromPos(pos);
    var node = ref.node;
    var offset = ref.offset;
    var after = offset < node.childNodes.length ? node.childNodes[offset] : null;
    var before = offset ? node.childNodes[offset - 1] : null;
    if ((!after || after.contentEditable == "false") && (!before || before.contentEditable == "false")) {
      if (after) {
        after.contentEditable = "true";
        return after
      } else if (before) {
        before.contentEditable = "true";
        return before
      }
    }
  }

  function removeClassOnSelectionChange(view) {
    var doc = view.dom.ownerDocument;
    doc.removeEventListener("selectionchange", view.hideSelectionGuard);
    var domSel = view.root.getSelection();
    var node = domSel.anchorNode, offset = domSel.anchorOffset;
    doc.addEventListener("selectionchange", view.hideSelectionGuard = function () {
      if (domSel.anchorNode != node || domSel.anchorOffset != offset) {
        doc.removeEventListener("selectionchange", view.hideSelectionGuard);
        view.dom.classList.remove("ProseMirror-hideselection");
      }
    });
  }

  function selectCursorWrapper(view) {
    var domSel = view.root.getSelection(), range = document.createRange();
    var node = view.cursorWrapper.dom;
    range.setEnd(node, node.childNodes.length);
    range.collapse(false);
    domSel.removeAllRanges();
    domSel.addRange(range);
    // Kludge to kill 'control selection' in IE11 when selecting an
    // invisible cursor wrapper, since that would result in those weird
    // resize handles and a selection that considers the absolutely
    // positioned wrapper, rather than the root editable node, the
    // focused element.
    if (!view.state.selection.visible && result.ie && result.ie_version <= 11) {
      node.disabled = true;
      node.disabled = false;
    }
  }

  function syncNodeSelection(view, sel) {
    if (sel instanceof dist$3.NodeSelection) {
      var desc = view.docView.descAt(sel.from);
      if (desc != view.lastSelectedViewDesc) {
        clearNodeSelection(view);
        if (desc) { desc.selectNode(); }
        view.lastSelectedViewDesc = desc;
      }
    } else {
      clearNodeSelection(view);
    }
  }

  // Clear all DOM statefulness of the last node selection.
  function clearNodeSelection(view) {
    if (view.lastSelectedViewDesc) {
      if (view.lastSelectedViewDesc.parent)
        { view.lastSelectedViewDesc.deselectNode(); }
      view.lastSelectedViewDesc = null;
    }
  }

  function selectionBetween(view, $anchor, $head, bias) {
    return view.someProp("createSelectionBetween", function (f) { return f(view, $anchor, $head); })
      || dist$3.TextSelection.between($anchor, $head, bias)
  }

  function hasFocusAndSelection(view) {
    if (view.editable && view.root.activeElement != view.dom) { return false }
    return hasSelection(view)
  }

  function hasSelection(view) {
    var sel = view.root.getSelection();
    if (!sel.anchorNode) { return false }
    try {
      // Firefox will raise 'permission denied' errors when accessing
      // properties of `sel.anchorNode` when it's in a generated CSS
      // element.
      return view.dom.contains(sel.anchorNode.nodeType == 3 ? sel.anchorNode.parentNode : sel.anchorNode) &&
        (view.editable || view.dom.contains(sel.focusNode.nodeType == 3 ? sel.focusNode.parentNode : sel.focusNode))
    } catch(_) {
      return false
    }
  }

  function nonInclusiveMark(mark) {
    return mark.type.spec.inclusive === false
  }

  function needsCursorWrapper(state) {
    var ref = state.selection;
    var $head = ref.$head;
    var $anchor = ref.$anchor;
    var visible = ref.visible;
    var $pos = $head.pos == $anchor.pos && (!visible || $head.parent.inlineContent) ? $head : null;
    if ($pos && (!visible || state.storedMarks || $pos.parent.content.length == 0 ||
                 $pos.parentOffset && !$pos.textOffset && $pos.nodeBefore.marks.some(nonInclusiveMark)))
      { return $pos }
    else
      { return null }
  }

  function anchorInRightPlace(view) {
    var anchorDOM = view.docView.domFromPos(view.state.selection.anchor);
    var domSel = view.root.getSelection();
    return isEquivalentPosition(anchorDOM.node, anchorDOM.offset, domSel.anchorNode, domSel.anchorOffset)
  }

  // Note that all referencing and parsing is done with the
  // start-of-operation selection and document, since that's the one
  // that the DOM represents. If any changes came in in the meantime,
  // the modification is mapped over those before it is applied, in
  // readDOMChange.

  function parseBetween(view, from_, to_) {
    var ref = view.docView.parseRange(from_, to_);
    var parent = ref.node;
    var fromOffset = ref.fromOffset;
    var toOffset = ref.toOffset;
    var from = ref.from;
    var to = ref.to;

    var domSel = view.root.getSelection(), find = null, anchor = domSel.anchorNode;
    if (anchor && view.dom.contains(anchor.nodeType == 1 ? anchor : anchor.parentNode)) {
      find = [{node: anchor, offset: domSel.anchorOffset}];
      if (!selectionCollapsed(domSel))
        { find.push({node: domSel.focusNode, offset: domSel.focusOffset}); }
    }
    // Work around issue in Chrome where backspacing sometimes replaces
    // the deleted content with a random BR node (issues #799, #831)
    if (result.chrome && view.lastKeyCode === 8) {
      for (var off = toOffset; off > fromOffset; off--) {
        var node = parent.childNodes[off - 1], desc = node.pmViewDesc;
        if (node.nodeType == "BR" && !desc) { toOffset = off; break }
        if (!desc || desc.size) { break }
      }
    }
    var startDoc = view.state.doc;
    var parser = view.someProp("domParser") || dist.DOMParser.fromSchema(view.state.schema);
    var $from = startDoc.resolve(from);
    var sel = null, doc = parser.parse(parent, {
      topNode: $from.parent,
      topMatch: $from.parent.contentMatchAt($from.index()),
      topOpen: true,
      from: fromOffset,
      to: toOffset,
      preserveWhitespace: $from.parent.type.spec.code ? "full" : true,
      editableContent: true,
      findPositions: find,
      ruleFromNode: ruleFromNode(parser, $from),
      context: $from
    });
    if (find && find[0].pos != null) {
      var anchor$1 = find[0].pos, head = find[1] && find[1].pos;
      if (head == null) { head = anchor$1; }
      sel = {anchor: anchor$1 + from, head: head + from};
    }
    return {doc: doc, sel: sel, from: from, to: to}
  }

  function ruleFromNode(parser, context) {
    return function (dom) {
      var desc = dom.pmViewDesc;
      if (desc) {
        return desc.parseRule()
      } else if (dom.nodeName == "BR" && dom.parentNode) {
        // Safari replaces the list item or table cell with a BR
        // directly in the list node (?!) if you delete the last
        // character in a list item or table cell (#708, #862)
        if (result.safari && /^(ul|ol)$/i.test(dom.parentNode.nodeName))
          { return parser.matchTag(document.createElement("li"), context) }
        else if (dom.parentNode.lastChild == dom || result.safari && /^(tr|table)$/i.test(dom.parentNode.nodeName))
          { return {ignore: true} }
      }
    }
  }

  function readDOMChange(view, from, to, typeOver) {
    if (from < 0) {
      var origin = view.lastSelectionTime > Date.now() - 50 ? view.lastSelectionOrigin : null;
      var newSel = selectionFromDOM(view, origin);
      if (!view.state.selection.eq(newSel)) {
        var tr$1 = view.state.tr.setSelection(newSel);
        if (origin == "pointer") { tr$1.setMeta("pointer", true); }
        else if (origin == "key") { tr$1.scrollIntoView(); }
        view.dispatch(tr$1);
      }
      return
    }

    var $before = view.state.doc.resolve(from);
    var shared = $before.sharedDepth(to);
    from = $before.before(shared + 1);
    to = view.state.doc.resolve(to).after(shared + 1);

    var sel = view.state.selection;
    var parse = parseBetween(view, from, to);

    var doc = view.state.doc, compare = doc.slice(parse.from, parse.to);
    var preferredPos, preferredSide;
    // Prefer anchoring to end when Backspace is pressed
    if (view.lastKeyCode === 8 && Date.now() - 100 < view.lastKeyCodeTime) {
      preferredPos = view.state.selection.to;
      preferredSide = "end";
    } else {
      preferredPos = view.state.selection.from;
      preferredSide = "start";
    }
    view.lastKeyCode = null;

    var change = findDiff(compare.content, parse.doc.content, parse.from, preferredPos, preferredSide);
    if (!change) {
      if (typeOver && sel instanceof dist$3.TextSelection && !sel.empty && sel.$head.sameParent(sel.$anchor) &&
          !view.composing && !(parse.sel && parse.sel.anchor != parse.sel.head)) {
        var state = view.state, sel$1 = state.selection;
        view.dispatch(state.tr.replaceSelectionWith(state.schema.text(state.doc.textBetween(sel$1.from, sel$1.to)), true).scrollIntoView());
      } else if (parse.sel) {
        var sel$2 = resolveSelection(view, view.state.doc, parse.sel);
        if (sel$2 && !sel$2.eq(view.state.selection)) { view.dispatch(view.state.tr.setSelection(sel$2)); }
      }
      return
    }
    view.domChangeCount++;
    // Handle the case where overwriting a selection by typing matches
    // the start or end of the selected content, creating a change
    // that's smaller than what was actually overwritten.
    if (view.state.selection.from < view.state.selection.to &&
        change.start == change.endB &&
        view.state.selection instanceof dist$3.TextSelection) {
      if (change.start > view.state.selection.from && change.start <= view.state.selection.from + 2) {
        change.start = view.state.selection.from;
      } else if (change.endA < view.state.selection.to && change.endA >= view.state.selection.to - 2) {
        change.endB += (view.state.selection.to - change.endA);
        change.endA = view.state.selection.to;
      }
    }

    var $from = parse.doc.resolveNoCache(change.start - parse.from);
    var $to = parse.doc.resolveNoCache(change.endB - parse.from);
    var nextSel;
    // If this looks like the effect of pressing Enter, just dispatch an
    // Enter key instead.
    if (!$from.sameParent($to) && $from.pos < parse.doc.content.size &&
        (nextSel = dist$3.Selection.findFrom(parse.doc.resolve($from.pos + 1), 1, true)) &&
        nextSel.head == $to.pos &&
        view.someProp("handleKeyDown", function (f) { return f(view, keyEvent(13, "Enter")); }))
      { return }
    // Same for backspace
    if (view.state.selection.anchor > change.start &&
        looksLikeJoin(doc, change.start, change.endA, $from, $to) &&
        view.someProp("handleKeyDown", function (f) { return f(view, keyEvent(8, "Backspace")); })) {
      if (result.android && result.chrome) { // #820
        view.domObserver.suppressSelectionUpdates = true;
        setTimeout(function () { return view.domObserver.suppressSelectionUpdates = false; }, 50);
      }
      return
    }

    var chFrom = change.start, chTo = change.endA;

    var tr, storedMarks, markChange, $from1;
    if ($from.sameParent($to) && $from.parent.inlineContent) {
      if ($from.pos == $to.pos) { // Deletion
        tr = view.state.tr.delete(chFrom, chTo);
        storedMarks = doc.resolve(change.start).marksAcross(doc.resolve(change.endA));
      } else if ( // Adding or removing a mark
        change.endA == change.endB && ($from1 = doc.resolve(change.start)) &&
        (markChange = isMarkChange($from.parent.content.cut($from.parentOffset, $to.parentOffset),
                                   $from1.parent.content.cut($from1.parentOffset, change.endA - $from1.start())))
      ) {
        tr = view.state.tr;
        if (markChange.type == "add") { tr.addMark(chFrom, chTo, markChange.mark); }
        else { tr.removeMark(chFrom, chTo, markChange.mark); }
      } else if ($from.parent.child($from.index()).isText && $from.index() == $to.index() - ($to.textOffset ? 0 : 1)) {
        // Both positions in the same text node -- simply insert text
        var text = $from.parent.textBetween($from.parentOffset, $to.parentOffset);
        if (view.someProp("handleTextInput", function (f) { return f(view, chFrom, chTo, text); })) { return }
        tr = view.state.tr.insertText(text, chFrom, chTo);
      }
    }

    if (!tr)
      { tr = view.state.tr.replace(chFrom, chTo, parse.doc.slice(change.start - parse.from, change.endB - parse.from)); }
    if (parse.sel) {
      var sel$3 = resolveSelection(view, tr.doc, parse.sel);
      if (sel$3) { tr.setSelection(sel$3); }
    }
    if (storedMarks) { tr.ensureMarks(storedMarks); }
    view.dispatch(tr.scrollIntoView());
  }

  function resolveSelection(view, doc, parsedSel) {
    if (Math.max(parsedSel.anchor, parsedSel.head) > doc.content.size) { return null }
    return selectionBetween(view, doc.resolve(parsedSel.anchor), doc.resolve(parsedSel.head))
  }

  // : (Fragment, Fragment) → ?{mark: Mark, type: string}
  // Given two same-length, non-empty fragments of inline content,
  // determine whether the first could be created from the second by
  // removing or adding a single mark type.
  function isMarkChange(cur, prev) {
    var curMarks = cur.firstChild.marks, prevMarks = prev.firstChild.marks;
    var added = curMarks, removed = prevMarks, type, mark, update;
    for (var i = 0; i < prevMarks.length; i++) { added = prevMarks[i].removeFromSet(added); }
    for (var i$1 = 0; i$1 < curMarks.length; i$1++) { removed = curMarks[i$1].removeFromSet(removed); }
    if (added.length == 1 && removed.length == 0) {
      mark = added[0];
      type = "add";
      update = function (node) { return node.mark(mark.addToSet(node.marks)); };
    } else if (added.length == 0 && removed.length == 1) {
      mark = removed[0];
      type = "remove";
      update = function (node) { return node.mark(mark.removeFromSet(node.marks)); };
    } else {
      return null
    }
    var updated = [];
    for (var i$2 = 0; i$2 < prev.childCount; i$2++) { updated.push(update(prev.child(i$2))); }
    if (dist.Fragment.from(updated).eq(cur)) { return {mark: mark, type: type} }
  }

  function looksLikeJoin(old, start, end, $newStart, $newEnd) {
    if (!$newStart.parent.isTextblock ||
        // The content must have shrunk
        end - start <= $newEnd.pos - $newStart.pos ||
        // newEnd must point directly at or after the end of the block that newStart points into
        skipClosingAndOpening($newStart, true, false) < $newEnd.pos)
      { return false }

    var $start = old.resolve(start);
    // Start must be at the end of a block
    if ($start.parentOffset < $start.parent.content.size || !$start.parent.isTextblock)
      { return false }
    var $next = old.resolve(skipClosingAndOpening($start, true, true));
    // The next textblock must start before end and end near it
    if (!$next.parent.isTextblock || $next.pos > end ||
        skipClosingAndOpening($next, true, false) < end)
      { return false }

    // The fragments after the join point must match
    return $newStart.parent.content.cut($newStart.parentOffset).eq($next.parent.content)
  }

  function skipClosingAndOpening($pos, fromEnd, mayOpen) {
    var depth = $pos.depth, end = fromEnd ? $pos.end() : $pos.pos;
    while (depth > 0 && (fromEnd || $pos.indexAfter(depth) == $pos.node(depth).childCount)) {
      depth--;
      end++;
      fromEnd = false;
    }
    if (mayOpen) {
      var next = $pos.node(depth).maybeChild($pos.indexAfter(depth));
      while (next && !next.isLeaf) {
        next = next.firstChild;
        end++;
      }
    }
    return end
  }

  function findDiff(a, b, pos, preferredPos, preferredSide) {
    var start = a.findDiffStart(b, pos);
    if (start == null) { return null }
    var ref = a.findDiffEnd(b, pos + a.size, pos + b.size);
    var endA = ref.a;
    var endB = ref.b;
    if (preferredSide == "end") {
      var adjust = Math.max(0, start - Math.min(endA, endB));
      preferredPos -= endA + adjust - start;
    }
    if (endA < start && a.size < b.size) {
      var move = preferredPos <= start && preferredPos >= endA ? start - preferredPos : 0;
      start -= move;
      endB = start + (endB - endA);
      endA = start;
    } else if (endB < start) {
      var move$1 = preferredPos <= start && preferredPos >= endB ? start - preferredPos : 0;
      start -= move$1;
      endA = start + (endA - endB);
      endB = start;
    }
    return {start: start, endA: endA, endB: endB}
  }

  function serializeForClipboard(view, slice) {
    var context = [];
    var content = slice.content;
    var openStart = slice.openStart;
    var openEnd = slice.openEnd;
    while (openStart > 1 && openEnd > 1 && content.childCount == 1 && content.firstChild.childCount == 1) {
      openStart--;
      openEnd--;
      var node = content.firstChild;
      context.push(node.type.name, node.type.hasRequiredAttrs() ? node.attrs : null);
      content = node.content;
    }

    var serializer = view.someProp("clipboardSerializer") || dist.DOMSerializer.fromSchema(view.state.schema);
    var wrap = document.createElement("div");
    wrap.appendChild(serializer.serializeFragment(content));

    var firstChild = wrap.firstChild, needsWrap;
    while (firstChild && firstChild.nodeType == 1 && (needsWrap = wrapMap[firstChild.nodeName.toLowerCase()])) {
      for (var i = needsWrap.length - 1; i >= 0; i--) {
        var wrapper = document.createElement(needsWrap[i]);
        while (wrap.firstChild) { wrapper.appendChild(wrap.firstChild); }
        wrap.appendChild(wrapper);
      }
      firstChild = wrap.firstChild;
    }

    if (firstChild && firstChild.nodeType == 1)
      { firstChild.setAttribute("data-pm-slice", (openStart + " " + openEnd + " " + (JSON.stringify(context)))); }

    var text = view.someProp("clipboardTextSerializer", function (f) { return f(slice); }) ||
        slice.content.textBetween(0, slice.content.size, "\n\n");

    return {dom: wrap, text: text}
  }

  // : (EditorView, string, string, ?bool, ResolvedPos) → ?Slice
  // Read a slice of content from the clipboard (or drop data).
  function parseFromClipboard(view, text, html, plainText, $context) {
    var dom, inCode = $context.parent.type.spec.code, slice;
    if (!html && !text) { return null }
    var asText = text && (plainText || inCode || !html);
    if (asText) {
      view.someProp("transformPastedText", function (f) { text = f(text); });
      if (inCode) { return new dist.Slice(dist.Fragment.from(view.state.schema.text(text)), 0, 0) }
      var parsed = view.someProp("clipboardTextParser", function (f) { return f(text, $context); });
      if (parsed) {
        slice = parsed;
      } else {
        dom = document.createElement("div");
        text.trim().split(/(?:\r\n?|\n)+/).forEach(function (block) {
          dom.appendChild(document.createElement("p")).textContent = block;
        });
      }
    } else {
      view.someProp("transformPastedHTML", function (f) { html = f(html); });
      dom = readHTML(html);
    }

    var contextNode = dom && dom.querySelector("[data-pm-slice]");
    var sliceData = contextNode && /^(\d+) (\d+) (.*)/.exec(contextNode.getAttribute("data-pm-slice"));
    if (!slice) {
      var parser = view.someProp("clipboardParser") || view.someProp("domParser") || dist.DOMParser.fromSchema(view.state.schema);
      slice = parser.parseSlice(dom, {preserveWhitespace: !!(asText || sliceData), context: $context});
    }
    if (sliceData)
      { slice = addContext(new dist.Slice(slice.content, Math.min(slice.openStart, +sliceData[1]),
                                   Math.min(slice.openEnd, +sliceData[2])), sliceData[3]); }
    else // HTML wasn't created by ProseMirror. Make sure top-level siblings are coherent
      { slice = dist.Slice.maxOpen(normalizeSiblings(slice.content, $context), false); }
    view.someProp("transformPasted", function (f) { slice = f(slice); });
    return slice
  }

  // Takes a slice parsed with parseSlice, which means there hasn't been
  // any content-expression checking done on the top nodes, tries to
  // find a parent node in the current context that might fit the nodes,
  // and if successful, rebuilds the slice so that it fits into that parent.
  //
  // This addresses the problem that Transform.replace expects a
  // coherent slice, and will fail to place a set of siblings that don't
  // fit anywhere in the schema.
  function normalizeSiblings(fragment, $context) {
    if (fragment.childCount < 2) { return fragment }
    var loop = function ( d ) {
      var parent = $context.node(d);
      var match = parent.contentMatchAt($context.index(d));
      var lastWrap = (void 0), result = [];
      fragment.forEach(function (node) {
        if (!result) { return }
        var wrap = match.findWrapping(node.type), inLast;
        if (!wrap) { return result = null }
        if (inLast = result.length && lastWrap.length && addToSibling(wrap, lastWrap, node, result[result.length - 1], 0)) {
          result[result.length - 1] = inLast;
        } else {
          if (result.length) { result[result.length - 1] = closeRight(result[result.length - 1], lastWrap.length); }
          var wrapped = withWrappers(node, wrap);
          result.push(wrapped);
          match = match.matchType(wrapped.type, wrapped.attrs);
          lastWrap = wrap;
        }
      });
      if (result) { return { v: dist.Fragment.from(result) } }
    };

    for (var d = $context.depth; d >= 0; d--) {
      var returned = loop( d );

      if ( returned ) return returned.v;
    }
    return fragment
  }

  function withWrappers(node, wrap, from) {
    if ( from === void 0 ) from = 0;

    for (var i = wrap.length - 1; i >= from; i--)
      { node = wrap[i].create(null, dist.Fragment.from(node)); }
    return node
  }

  // Used to group adjacent nodes wrapped in similar parents by
  // normalizeSiblings into the same parent node
  function addToSibling(wrap, lastWrap, node, sibling, depth) {
    if (depth < wrap.length && depth < lastWrap.length && wrap[depth] == lastWrap[depth]) {
      var inner = addToSibling(wrap, lastWrap, node, sibling.lastChild, depth + 1);
      if (inner) { return sibling.copy(sibling.content.replaceChild(sibling.childCount - 1, inner)) }
      var match = sibling.contentMatchAt(sibling.childCount);
      if (match.matchType(depth == wrap.length - 1 ? node.type : wrap[depth + 1]))
        { return sibling.copy(sibling.content.append(dist.Fragment.from(withWrappers(node, wrap, depth + 1)))) }
    }
  }

  function closeRight(node, depth) {
    if (depth == 0) { return node }
    var fragment = node.content.replaceChild(node.childCount - 1, closeRight(node.lastChild, depth - 1));
    var fill = node.contentMatchAt(node.childCount).fillBefore(dist.Fragment.empty, true);
    return node.copy(fragment.append(fill))
  }

  // Trick from jQuery -- some elements must be wrapped in other
  // elements for innerHTML to work. I.e. if you do `div.innerHTML =
  // "<td>..</td>"` the table cells are ignored.
  var wrapMap = {thead: ["table"], colgroup: ["table"], col: ["table", "colgroup"],
                   tr: ["table", "tbody"], td: ["table", "tbody", "tr"], th: ["table", "tbody", "tr"]};
  var detachedDoc = null;
  function readHTML(html) {
    var metas = /(\s*<meta [^>]*>)*/.exec(html);
    if (metas) { html = html.slice(metas[0].length); }
    var doc = detachedDoc || (detachedDoc = document.implementation.createHTMLDocument("title"));
    var elt = doc.createElement("div");
    var firstTag = /(?:<meta [^>]*>)*<([a-z][^>\s]+)/i.exec(html), wrap, depth = 0;
    if (wrap = firstTag && wrapMap[firstTag[1].toLowerCase()]) {
      html = wrap.map(function (n) { return "<" + n + ">"; }).join("") + html + wrap.map(function (n) { return "</" + n + ">"; }).reverse().join("");
      depth = wrap.length;
    }
    elt.innerHTML = html;
    for (var i = 0; i < depth; i++) { elt = elt.firstChild; }
    return elt
  }

  function addContext(slice, context) {
    if (!slice.size) { return slice }
    var schema = slice.content.firstChild.type.schema, array;
    try { array = JSON.parse(context); }
    catch(e) { return slice }
    var content = slice.content;
    var openStart = slice.openStart;
    var openEnd = slice.openEnd;
    for (var i = array.length - 2; i >= 0; i -= 2) {
      var type = schema.nodes[array[i]];
      if (!type || type.hasRequiredAttrs()) { break }
      content = dist.Fragment.from(type.create(array[i + 1], content));
      openStart++; openEnd++;
    }
    return new dist.Slice(content, openStart, openEnd)
  }

  var observeOptions = {childList: true, characterData: true, attributes: true, subtree: true, characterDataOldValue: true};
  // IE11 has very broken mutation observers, so we also listen to DOMCharacterDataModified
  var useCharData = result.ie && result.ie_version <= 11;

  var SelectionState = function SelectionState() {
    this.anchorNode = this.anchorOffset = this.focusNode = this.focusOffset = null;
  };

  SelectionState.prototype.set = function set (sel) {
    this.anchorNode = sel.anchorNode; this.anchorOffset = sel.anchorOffset;
    this.focusNode = sel.focusNode; this.focusOffset = sel.focusOffset;
  };

  SelectionState.prototype.eq = function eq (sel) {
    return sel.anchorNode == this.anchorNode && sel.anchorOffset == this.anchorOffset &&
      sel.focusNode == this.focusNode && sel.focusOffset == this.focusOffset
  };

  var DOMObserver = function DOMObserver(view, handleDOMChange) {
    var this$1 = this;

    this.view = view;
    this.handleDOMChange = handleDOMChange;
    this.observer = window.MutationObserver &&
      new window.MutationObserver(function (mutations) { return this$1.flush(mutations); });
    this.currentSelection = new SelectionState;
    this.queue = [];
    if (useCharData) {
      this.onCharData = function (e) {
        this$1.queue.push({target: e.target, type: "characterData", oldValue: e.prevValue});
        window.setTimeout(function () { return this$1.flush(); }, 20);
      };
    }
    this.onSelectionChange = this.onSelectionChange.bind(this);
  };

  DOMObserver.prototype.start = function start () {
    if (this.observer)
      { this.observer.observe(this.view.dom, observeOptions); }
    if (useCharData)
      { this.view.dom.addEventListener("DOMCharacterDataModified", this.onCharData); }
    this.connectSelection();
  };

  DOMObserver.prototype.stop = function stop () {
      var this$1 = this;

    var take = this.observer.takeRecords();
    if (take.length) {
      for (var i = 0; i < take.length; i++) { this$1.queue.push(take[i]); }
      window.setTimeout(function () { return this$1.flush(); }, 20);
    }
    if (this.observer) { this.observer.disconnect(); }
    if (useCharData) { this.view.dom.removeEventListener("DOMCharacterDataModified", this.onCharData); }
    this.disconnectSelection();
  };

  DOMObserver.prototype.connectSelection = function connectSelection () {
    this.view.dom.ownerDocument.addEventListener("selectionchange", this.onSelectionChange);
  };

  DOMObserver.prototype.disconnectSelection = function disconnectSelection () {
    this.view.dom.ownerDocument.removeEventListener("selectionchange", this.onSelectionChange);
  };

  DOMObserver.prototype.onSelectionChange = function onSelectionChange () {
    if (!hasFocusAndSelection(this.view)) { return }
    if (this.suppressSelectionUpdates) { return selectionToDOM(this.view) }
    this.flush();
  };

  DOMObserver.prototype.setCurSelection = function setCurSelection () {
    this.currentSelection.set(this.view.root.getSelection());
  };

  DOMObserver.prototype.flush = function flush (mutations) {
      var this$1 = this;

    if (!this.view.docView) { return }
    if (!mutations) { mutations = this.observer.takeRecords(); }
    if (this.queue.length) {
      mutations = this.queue.concat(mutations);
      this.queue.length = 0;
    }

    var sel = this.view.root.getSelection();
    var newSel = !this.currentSelection.eq(sel) && hasSelection(this.view);

    var from = -1, to = -1, typeOver = false;
    if (this.view.editable) {
      for (var i = 0; i < mutations.length; i++) {
        var result$$1 = this$1.registerMutation(mutations[i]);
        if (result$$1) {
          from = from < 0 ? result$$1.from : Math.min(result$$1.from, from);
          to = to < 0 ? result$$1.to : Math.max(result$$1.to, to);
          if (result$$1.typeOver) { typeOver = true; }
        }
      }
    }
    if (from > -1 || newSel) {
      if (from > -1) { this.view.docView.markDirty(from, to); }
      this.handleDOMChange(from, to, typeOver);
      if (this.view.docView.dirty) { this.view.updateState(this.view.state); }
      else if (!this.currentSelection.eq(sel)) { selectionToDOM(this.view); }
    }
  };

  DOMObserver.prototype.registerMutation = function registerMutation (mut) {
    var desc = this.view.docView.nearestDesc(mut.target);
    if (mut.type == "attributes" &&
        (desc == this.view.docView || mut.attributeName == "contenteditable")) { return null }
    if (!desc || desc.ignoreMutation(mut)) { return null }

    if (mut.type == "childList") {
      var fromOffset = mut.previousSibling && mut.previousSibling.parentNode == mut.target
          ? domIndex(mut.previousSibling) + 1 : 0;
      var from = desc.localPosFromDOM(mut.target, fromOffset, -1);
      var toOffset = mut.nextSibling && mut.nextSibling.parentNode == mut.target
          ? domIndex(mut.nextSibling) : mut.target.childNodes.length;
      var to = desc.localPosFromDOM(mut.target, toOffset, 1);
      return {from: from, to: to}
    } else if (mut.type == "attributes") {
      return {from: desc.posAtStart - desc.border, to: desc.posAtEnd + desc.border}
    } else { // "characterData"
      return {
        from: desc.posAtStart,
        to: desc.posAtEnd,
        // An event was generated for a text change that didn't change
        // any text. Mark the dom change to fall back to assuming the
        // selection was typed over with an identical value if it can't
        // find another change.
        typeOver: mut.target.nodeValue == mut.oldValue
      }
    }
  };

  // A collection of DOM events that occur within the editor, and callback functions
  // to invoke when the event fires.
  var handlers = {};
  var editHandlers = {};

  function initInput(view) {
    view.shiftKey = false;
    view.mouseDown = null;
    view.lastKeyCode = null;
    view.lastKeyCodeTime = 0;
    view.lastClick = {time: 0, x: 0, y: 0, type: ""};
    view.lastSelectionOrigin = null;
    view.lastSelectionTime = 0;

    view.composing = false;
    view.composingTimeout = null;
    view.compositionNodes = [];
    view.compositionEndedAt = -2e8;

    view.domObserver = new DOMObserver(view, function (from, to, typeOver) { return readDOMChange(view, from, to, typeOver); });
    view.domObserver.start();
    // Used by hacks like the beforeinput handler to check whether anything happened in the DOM
    view.domChangeCount = 0;

    view.eventHandlers = Object.create(null);
    var loop = function ( event ) {
      var handler = handlers[event];
      view.dom.addEventListener(event, view.eventHandlers[event] = function (event) {
        if (eventBelongsToView(view, event) && !runCustomHandler(view, event) &&
            (view.editable || !(event.type in editHandlers)))
          { handler(view, event); }
      });
    };

    for (var event in handlers) loop( event );
    // On Safari, for reasons beyond my understanding, adding an input
    // event handler makes an issue where the composition vanishes when
    // you press enter go away.
    if (result.safari) { view.dom.addEventListener("input", function () { return null; }); }

    ensureListeners(view);
  }

  function setSelectionOrigin(view, origin) {
    view.lastSelectionOrigin = origin;
    view.lastSelectionTime = Date.now();
  }

  function destroyInput(view) {
    view.domObserver.stop();
    for (var type in view.eventHandlers)
      { view.dom.removeEventListener(type, view.eventHandlers[type]); }
    clearTimeout(view.composingTimeout);
  }

  function ensureListeners(view) {
    view.someProp("handleDOMEvents", function (currentHandlers) {
      for (var type in currentHandlers) { if (!view.eventHandlers[type])
        { view.dom.addEventListener(type, view.eventHandlers[type] = function (event) { return runCustomHandler(view, event); }); } }
    });
  }

  function runCustomHandler(view, event) {
    return view.someProp("handleDOMEvents", function (handlers) {
      var handler = handlers[event.type];
      return handler ? handler(view, event) || event.defaultPrevented : false
    })
  }

  function eventBelongsToView(view, event) {
    if (!event.bubbles) { return true }
    if (event.defaultPrevented) { return false }
    for (var node = event.target; node != view.dom; node = node.parentNode)
      { if (!node || node.nodeType == 11 ||
          (node.pmViewDesc && node.pmViewDesc.stopEvent(event)))
        { return false } }
    return true
  }

  function dispatchEvent(view, event) {
    if (!runCustomHandler(view, event) && handlers[event.type] &&
        (view.editable || !(event.type in editHandlers)))
      { handlers[event.type](view, event); }
  }

  editHandlers.keydown = function (view, event) {
    view.shiftKey = event.keyCode == 16 || event.shiftKey;
    if (inOrNearComposition(view, event)) { return }
    view.lastKeyCode = event.keyCode;
    view.lastKeyCodeTime = Date.now();
    if (view.someProp("handleKeyDown", function (f) { return f(view, event); }) || captureKeyDown(view, event))
      { event.preventDefault(); }
    else
      { setSelectionOrigin(view, "key"); }
  };

  editHandlers.keyup = function (view, e) {
    if (e.keyCode == 16) { view.shiftKey = false; }
  };

  editHandlers.keypress = function (view, event) {
    if (inOrNearComposition(view, event) || !event.charCode ||
        event.ctrlKey && !event.altKey || result.mac && event.metaKey) { return }

    if (view.someProp("handleKeyPress", function (f) { return f(view, event); })) {
      event.preventDefault();
      return
    }

    var sel = view.state.selection;
    if (!(sel instanceof dist$3.TextSelection) || !sel.$from.sameParent(sel.$to)) {
      var text = String.fromCharCode(event.charCode);
      if (!view.someProp("handleTextInput", function (f) { return f(view, sel.$from.pos, sel.$to.pos, text); }))
        { view.dispatch(view.state.tr.insertText(text).scrollIntoView()); }
      event.preventDefault();
    }
  };

  function eventCoords(event) { return {left: event.clientX, top: event.clientY} }

  function isNear(event, click) {
    var dx = click.x - event.clientX, dy = click.y - event.clientY;
    return dx * dx + dy * dy < 100
  }

  function runHandlerOnContext(view, propName, pos, inside, event) {
    if (inside == -1) { return false }
    var $pos = view.state.doc.resolve(inside);
    var loop = function ( i ) {
      if (view.someProp(propName, function (f) { return i > $pos.depth ? f(view, pos, $pos.nodeAfter, $pos.before(i), event, true)
                                                      : f(view, pos, $pos.node(i), $pos.before(i), event, false); }))
        { return { v: true } }
    };

    for (var i = $pos.depth + 1; i > 0; i--) {
      var returned = loop( i );

      if ( returned ) return returned.v;
    }
    return false
  }

  function updateSelection(view, selection, origin) {
    if (!view.focused) { view.focus(); }
    var tr = view.state.tr.setSelection(selection);
    if (origin == "pointer") { tr.setMeta("pointer", true); }
    view.dispatch(tr);
  }

  function selectClickedLeaf(view, inside) {
    if (inside == -1) { return false }
    var $pos = view.state.doc.resolve(inside), node = $pos.nodeAfter;
    if (node && node.isAtom && dist$3.NodeSelection.isSelectable(node)) {
      updateSelection(view, new dist$3.NodeSelection($pos), "pointer");
      return true
    }
    return false
  }

  function selectClickedNode(view, inside) {
    if (inside == -1) { return false }
    var sel = view.state.selection, selectedNode, selectAt;
    if (sel instanceof dist$3.NodeSelection) { selectedNode = sel.node; }

    var $pos = view.state.doc.resolve(inside);
    for (var i = $pos.depth + 1; i > 0; i--) {
      var node = i > $pos.depth ? $pos.nodeAfter : $pos.node(i);
      if (dist$3.NodeSelection.isSelectable(node)) {
        if (selectedNode && sel.$from.depth > 0 &&
            i >= sel.$from.depth && $pos.before(sel.$from.depth + 1) == sel.$from.pos)
          { selectAt = $pos.before(sel.$from.depth); }
        else
          { selectAt = $pos.before(i); }
        break
      }
    }

    if (selectAt != null) {
      updateSelection(view, dist$3.NodeSelection.create(view.state.doc, selectAt), "pointer");
      return true
    } else {
      return false
    }
  }

  function handleSingleClick(view, pos, inside, event, selectNode) {
    return runHandlerOnContext(view, "handleClickOn", pos, inside, event) ||
      view.someProp("handleClick", function (f) { return f(view, pos, event); }) ||
      (selectNode ? selectClickedNode(view, inside) : selectClickedLeaf(view, inside))
  }

  function handleDoubleClick(view, pos, inside, event) {
    return runHandlerOnContext(view, "handleDoubleClickOn", pos, inside, event) ||
      view.someProp("handleDoubleClick", function (f) { return f(view, pos, event); })
  }

  function handleTripleClick(view, pos, inside, event) {
    return runHandlerOnContext(view, "handleTripleClickOn", pos, inside, event) ||
      view.someProp("handleTripleClick", function (f) { return f(view, pos, event); }) ||
      defaultTripleClick(view, inside)
  }

  function defaultTripleClick(view, inside) {
    var doc = view.state.doc;
    if (inside == -1) {
      if (doc.inlineContent) {
        updateSelection(view, dist$3.TextSelection.create(doc, 0, doc.content.size), "pointer");
        return true
      }
      return false
    }

    var $pos = doc.resolve(inside);
    for (var i = $pos.depth + 1; i > 0; i--) {
      var node = i > $pos.depth ? $pos.nodeAfter : $pos.node(i);
      var nodePos = $pos.before(i);
      if (node.inlineContent)
        { updateSelection(view, dist$3.TextSelection.create(doc, nodePos + 1, nodePos + 1 + node.content.size), "pointer"); }
      else if (dist$3.NodeSelection.isSelectable(node))
        { updateSelection(view, dist$3.NodeSelection.create(doc, nodePos), "pointer"); }
      else
        { continue }
      return true
    }
  }

  function forceDOMFlush(view) {
    return endComposition(view)
  }

  var selectNodeModifier = result.mac ? "metaKey" : "ctrlKey";

  handlers.mousedown = function (view, event) {
    view.shiftKey = event.shiftKey;
    var flushed = forceDOMFlush(view);
    var now = Date.now(), type = "singleClick";
    if (now - view.lastClick.time < 500 && isNear(event, view.lastClick) && !event[selectNodeModifier]) {
      if (view.lastClick.type == "singleClick") { type = "doubleClick"; }
      else if (view.lastClick.type == "doubleClick") { type = "tripleClick"; }
    }
    view.lastClick = {time: now, x: event.clientX, y: event.clientY, type: type};

    var pos = view.posAtCoords(eventCoords(event));
    if (!pos) { return }

    if (type == "singleClick")
      { view.mouseDown = new MouseDown(view, pos, event, flushed); }
    else if ((type == "doubleClick" ? handleDoubleClick : handleTripleClick)(view, pos.pos, pos.inside, event))
      { event.preventDefault(); }
    else
      { setSelectionOrigin(view, "pointer"); }
  };

  var MouseDown = function MouseDown(view, pos, event, flushed) {
    var this$1 = this;

    this.view = view;
    this.startDoc = view.state.doc;
    this.pos = pos;
    this.event = event;
    this.flushed = flushed;
    this.selectNode = event[selectNodeModifier];
    this.allowDefault = event.shiftKey;

    var targetNode, targetPos;
    if (pos.inside > -1) {
      targetNode = view.state.doc.nodeAt(pos.inside);
      targetPos = pos.inside;
    } else {
      var $pos = view.state.doc.resolve(pos.pos);
      targetNode = $pos.parent;
      targetPos = $pos.depth ? $pos.before() : 0;
    }

    this.mightDrag = null;

    var target = flushed ? null : event.target;
    var targetDesc = target ? view.docView.nearestDesc(target, true) : null;
    this.target = targetDesc ? targetDesc.dom : null;

    if (targetNode.type.spec.draggable && targetNode.type.spec.selectable !== false ||
        view.state.selection instanceof dist$3.NodeSelection && targetPos == view.state.selection.from)
      { this.mightDrag = {node: targetNode,
                        pos: targetPos,
                        addAttr: this.target && !this.target.draggable,
                        setUneditable: this.target && result.gecko && !this.target.hasAttribute("contentEditable")}; }

    if (this.target && this.mightDrag && (this.mightDrag.addAttr || this.mightDrag.setUneditable)) {
      this.view.domObserver.stop();
      if (this.mightDrag.addAttr) { this.target.draggable = true; }
      if (this.mightDrag.setUneditable)
        { setTimeout(function () { return this$1.target.setAttribute("contentEditable", "false"); }, 20); }
      this.view.domObserver.start();
    }

    view.root.addEventListener("mouseup", this.up = this.up.bind(this));
    view.root.addEventListener("mousemove", this.move = this.move.bind(this));
    setSelectionOrigin(view, "pointer");
  };

  MouseDown.prototype.done = function done () {
    this.view.root.removeEventListener("mouseup", this.up);
    this.view.root.removeEventListener("mousemove", this.move);
    if (this.mightDrag && this.target) {
      this.view.domObserver.stop();
      if (this.mightDrag.addAttr) { this.target.draggable = false; }
      if (this.mightDrag.setUneditable) { this.target.removeAttribute("contentEditable"); }
      this.view.domObserver.start();
    }
    this.view.mouseDown = null;
  };

  MouseDown.prototype.up = function up (event) {
    this.done();

    if (!this.view.dom.contains(event.target.nodeType == 3 ? event.target.parentNode : event.target))
      { return }

    var pos = this.pos;
    if (this.view.state.doc != this.startDoc) { pos = this.view.posAtCoords(eventCoords(event)); }

    if (this.allowDefault || !pos) {
      // Force a cursor wrapper redraw if this was suppressed (to avoid an issue with IE drag-selection)
      if (result.ie && needsCursorWrapper(this.view.state)) { this.view.updateState(this.view.state); }
      setSelectionOrigin(this.view, "pointer");
    } else if (handleSingleClick(this.view, pos.pos, pos.inside, event, this.selectNode)) {
      event.preventDefault();
    } else if (this.flushed ||
               // Chrome will sometimes treat a node selection as a
               // cursor, but still report that the node is selected
               // when asked through getSelection. You'll then get a
               // situation where clicking at the point where that
               // (hidden) cursor is doesn't change the selection, and
               // thus doesn't get a reaction from ProseMirror. This
               // works around that.
               (result.chrome && !(this.view.state.selection instanceof dist$3.TextSelection) &&
                (pos.pos == this.view.state.selection.from || pos.pos == this.view.state.selection.to))) {
      updateSelection(this.view, dist$3.Selection.near(this.view.state.doc.resolve(pos.pos)), "pointer");
      event.preventDefault();
    } else {
      setSelectionOrigin(this.view, "pointer");
    }
  };

  MouseDown.prototype.move = function move (event) {
    if (!this.allowDefault && (Math.abs(this.event.x - event.clientX) > 4 ||
                               Math.abs(this.event.y - event.clientY) > 4))
      { this.allowDefault = true; }
    setSelectionOrigin(this.view, "pointer");
  };

  handlers.touchdown = function (view) {
    forceDOMFlush(view);
    setSelectionOrigin(view, "pointer");
  };

  handlers.contextmenu = function (view) { return forceDOMFlush(view); };

  function inOrNearComposition(view, event) {
    if (view.composing) { return true }
    // See https://www.stum.de/2016/06/24/handling-ime-events-in-javascript/.
    // On Japanese input method editors (IMEs), the Enter key is used to confirm character
    // selection. On Safari, when Enter is pressed, compositionend and keydown events are
    // emitted. The keydown event triggers newline insertion, which we don't want.
    // This method returns true if the keydown event should be ignored.
    // We only ignore it once, as pressing Enter a second time *should* insert a newline.
    // Furthermore, the keydown event timestamp must be close to the compositionEndedAt timestamp.
    // This guards against the case where compositionend is triggered without the keyboard
    // (e.g. character confirmation may be done with the mouse), and keydown is triggered
    // afterwards- we wouldn't want to ignore the keydown event in this case.
    if (result.safari && Math.abs(event.timeStamp - view.compositionEndedAt) < 500) {
      view.compositionEndedAt = -2e8;
      return true
    }
    return false
  }

  // Drop active composition after 5 seconds of inactivity on Android
  var timeoutComposition = result.android ? 5000 : -1;

  editHandlers.compositionstart = editHandlers.compositionupdate = function (view) {
    if (!view.composing) {
      view.domObserver.flush();
      endComposition(view);
      view.composing = true;
    }
    scheduleComposeEnd(view, timeoutComposition);
  };

  editHandlers.compositionend = function (view, event) {
    if (view.composing) {
      view.composing = false;
      view.compositionEndedAt = event.timeStamp;
      scheduleComposeEnd(view, 20);
    }
  };

  function scheduleComposeEnd(view, delay) {
    clearTimeout(view.composingTimeout);
    if (delay > -1) { view.composingTimeout = setTimeout(function () { return endComposition(view); }, delay); }
  }

  function endComposition(view) {
    view.composing = false;
    while (view.compositionNodes.length > 0) { view.compositionNodes.pop().markParentsDirty(); }
    if (view.docView.dirty) {
      view.updateState(view.state);
      return true
    }
    return false
  }

  function captureCopy(view, dom) {
    // The extra wrapper is somehow necessary on IE/Edge to prevent the
    // content from being mangled when it is put onto the clipboard
    var doc = dom.ownerDocument;
    var wrap = doc.body.appendChild(doc.createElement("div"));
    wrap.appendChild(dom);
    wrap.style.cssText = "position: fixed; left: -10000px; top: 10px";
    var sel = getSelection(), range = doc.createRange();
    range.selectNodeContents(dom);
    // Done because IE will fire a selectionchange moving the selection
    // to its start when removeAllRanges is called and the editor still
    // has focus (which will mess up the editor's selection state).
    view.dom.blur();
    sel.removeAllRanges();
    sel.addRange(range);
    setTimeout(function () {
      doc.body.removeChild(wrap);
      view.focus();
    }, 50);
  }

  // This is very crude, but unfortunately both these browsers _pretend_
  // that they have a clipboard API—all the objects and methods are
  // there, they just don't work, and they are hard to test.
  var brokenClipboardAPI = (result.ie && result.ie_version < 15) ||
        (result.ios && result.webkit_version < 604);

  handlers.copy = editHandlers.cut = function (view, e) {
    var sel = view.state.selection, cut = e.type == "cut";
    if (sel.empty) { return }

    // IE and Edge's clipboard interface is completely broken
    var data = brokenClipboardAPI ? null : e.clipboardData;
    var slice = sel.content();
    var ref = serializeForClipboard(view, slice);
    var dom = ref.dom;
    var text = ref.text;
    if (data) {
      e.preventDefault();
      data.clearData();
      data.setData("text/html", dom.innerHTML);
      data.setData("text/plain", text);
    } else {
      captureCopy(view, dom);
    }
    if (cut) { view.dispatch(view.state.tr.deleteSelection().scrollIntoView().setMeta("uiEvent", "cut")); }
  };

  function sliceSingleNode(slice) {
    return slice.openStart == 0 && slice.openEnd == 0 && slice.content.childCount == 1 ? slice.content.firstChild : null
  }

  function capturePaste(view, e) {
    var doc = view.dom.ownerDocument;
    var plainText = view.shiftKey || view.state.selection.$from.parent.type.spec.code;
    var target = doc.body.appendChild(doc.createElement(plainText ? "textarea" : "div"));
    if (!plainText) { target.contentEditable = "true"; }
    target.style.cssText = "position: fixed; left: -10000px; top: 10px";
    target.focus();
    setTimeout(function () {
      view.focus();
      doc.body.removeChild(target);
      if (plainText) { doPaste(view, target.value, null, e); }
      else { doPaste(view, target.textContent, target.innerHTML, e); }
    }, 50);
  }

  function doPaste(view, text, html, e) {
    var slice = parseFromClipboard(view, text, html, view.shiftKey, view.state.selection.$from);
    if (view.someProp("handlePaste", function (f) { return f(view, e, slice || dist.Slice.empty); }) || !slice) { return true }

    var singleNode = sliceSingleNode(slice);
    var tr = singleNode ? view.state.tr.replaceSelectionWith(singleNode, view.shiftKey) : view.state.tr.replaceSelection(slice);
    view.dispatch(tr.scrollIntoView().setMeta("paste", true).setMeta("uiEvent", "paste"));
    return true
  }

  editHandlers.paste = function (view, e) {
    var data = brokenClipboardAPI ? null : e.clipboardData;
    if (data && (doPaste(view, data.getData("text/plain"), data.getData("text/html"), e) || data.files.length > 0))
      { e.preventDefault(); }
    else
      { capturePaste(view, e); }
  };

  var Dragging = function Dragging(slice, move) {
    this.slice = slice;
    this.move = move;
  };

  var dragCopyModifier = result.mac ? "altKey" : "ctrlKey";

  handlers.dragstart = function (view, e) {
    var mouseDown = view.mouseDown;
    if (mouseDown) { mouseDown.done(); }
    if (!e.dataTransfer) { return }

    var sel = view.state.selection;
    var pos = sel.empty ? null : view.posAtCoords(eventCoords(e));
    if (pos && pos.pos >= sel.from && pos.pos <= (sel instanceof dist$3.NodeSelection ? sel.to - 1: sel.to)) ; else if (mouseDown && mouseDown.mightDrag) {
      view.dispatch(view.state.tr.setSelection(dist$3.NodeSelection.create(view.state.doc, mouseDown.mightDrag.pos)));
    } else if (e.target && e.target.nodeType == 1) {
      var desc = view.docView.nearestDesc(e.target, true);
      if (!desc || !desc.node.type.spec.draggable || desc == view.docView) { return }
      view.dispatch(view.state.tr.setSelection(dist$3.NodeSelection.create(view.state.doc, desc.posBefore)));
    }
    var slice = view.state.selection.content();
    var ref = serializeForClipboard(view, slice);
    var dom = ref.dom;
    var text = ref.text;
    e.dataTransfer.clearData();
    e.dataTransfer.setData(brokenClipboardAPI ? "Text" : "text/html", dom.innerHTML);
    if (!brokenClipboardAPI) { e.dataTransfer.setData("text/plain", text); }
    view.dragging = new Dragging(slice, !e[dragCopyModifier]);
  };

  handlers.dragend = function (view) {
    window.setTimeout(function () { return view.dragging = null; }, 50);
  };

  editHandlers.dragover = editHandlers.dragenter = function (_, e) { return e.preventDefault(); };

  editHandlers.drop = function (view, e) {
    var dragging = view.dragging;
    view.dragging = null;

    if (!e.dataTransfer) { return }

    var eventPos = view.posAtCoords(eventCoords(e));
    if (!eventPos) { return }
    var $mouse = view.state.doc.resolve(eventPos.pos);
    if (!$mouse) { return }
    var slice = dragging && dragging.slice ||
        parseFromClipboard(view, e.dataTransfer.getData(brokenClipboardAPI ? "Text" : "text/plain"),
                           brokenClipboardAPI ? null : e.dataTransfer.getData("text/html"), false, $mouse);
    if (!slice) { return }

    e.preventDefault();
    if (view.someProp("handleDrop", function (f) { return f(view, e, slice, dragging && dragging.move); })) { return }
    var insertPos = slice ? prosemirrorTransform.dropPoint(view.state.doc, $mouse.pos, slice) : $mouse.pos;
    if (insertPos == null) { insertPos = $mouse.pos; }

    var tr = view.state.tr;
    if (dragging && dragging.move) { tr.deleteSelection(); }

    var pos = tr.mapping.map(insertPos);
    var isNode = slice.openStart == 0 && slice.openEnd == 0 && slice.content.childCount == 1;
    var beforeInsert = tr.doc;
    if (isNode)
      { tr.replaceRangeWith(pos, pos, slice.content.firstChild); }
    else
      { tr.replaceRange(pos, pos, slice); }
    if (tr.doc.eq(beforeInsert)) { return }

    var $pos = tr.doc.resolve(pos);
    if (isNode && dist$3.NodeSelection.isSelectable(slice.content.firstChild) &&
        $pos.nodeAfter && $pos.nodeAfter.sameMarkup(slice.content.firstChild))
      { tr.setSelection(new dist$3.NodeSelection($pos)); }
    else
      { tr.setSelection(selectionBetween(view, $pos, tr.doc.resolve(tr.mapping.map(insertPos)))); }
    view.focus();
    view.dispatch(tr.setMeta("uiEvent", "drop"));
  };

  handlers.focus = function (view) {
    if (!view.focused) {
      view.domObserver.stop();
      view.dom.classList.add("ProseMirror-focused");
      view.domObserver.start();
      view.focused = true;
    }
  };

  handlers.blur = function (view) {
    if (view.focused) {
      view.domObserver.stop();
      view.dom.classList.remove("ProseMirror-focused");
      view.domObserver.start();
      view.focused = false;
    }
  };

  handlers.beforeinput = function (view, event) {
    // We should probably do more with beforeinput events, but support
    // is so spotty that I'm still waiting to see where they are going.

    // Very specific hack to deal with backspace sometimes failing on
    // Chrome Android when after an uneditable node.
    if (result.chrome && result.android && event.inputType == "deleteContentBackward") {
      var domChangeCount = view.domChangeCount;
      setTimeout(function () {
        if (view.domChangeCount != domChangeCount) { return } // Event already had some effect
        // This bug tends to close the virtual keyboard, so we refocus
        view.dom.blur();
        view.focus();
        if (view.someProp("handleKeyDown", function (f) { return f(view, keyEvent(8, "Backspace")); })) { return }
        var ref = view.state.selection;
        var $cursor = ref.$cursor;
        // Crude approximation of backspace behavior when no command handled it
        if ($cursor && $cursor.pos > 0) { view.dispatch(view.state.tr.delete($cursor.pos - 1, $cursor.pos).scrollIntoView()); }
      }, 50);
    }
  };

  // Make sure all handlers get registered
  for (var prop in editHandlers) { handlers[prop] = editHandlers[prop]; }

  function compareObjs(a, b) {
    if (a == b) { return true }
    for (var p in a) { if (a[p] !== b[p]) { return false } }
    for (var p$1 in b) { if (!(p$1 in a)) { return false } }
    return true
  }

  var WidgetType = function WidgetType(toDOM, spec) {
    this.spec = spec || noSpec;
    this.side = this.spec.side || 0;
    this.toDOM = toDOM;
  };

  WidgetType.prototype.map = function map (mapping, span, offset, oldOffset) {
    var ref = mapping.mapResult(span.from + oldOffset, this.side < 0 ? -1 : 1);
      var pos = ref.pos;
      var deleted = ref.deleted;
    return deleted ? null : new Decoration(pos - offset, pos - offset, this)
  };

  WidgetType.prototype.valid = function valid () { return true };

  WidgetType.prototype.eq = function eq (other) {
    return this == other ||
      (other instanceof WidgetType &&
       (this.spec.key && this.spec.key == other.spec.key ||
        this.toDOM == other.toDOM && compareObjs(this.spec, other.spec)))
  };

  var InlineType = function InlineType(attrs, spec) {
    this.spec = spec || noSpec;
    this.attrs = attrs;
  };

  InlineType.prototype.map = function map (mapping, span, offset, oldOffset) {
    var from = mapping.map(span.from + oldOffset, this.spec.inclusiveStart ? -1 : 1) - offset;
    var to = mapping.map(span.to + oldOffset, this.spec.inclusiveEnd ? 1 : -1) - offset;
    return from >= to ? null : new Decoration(from, to, this)
  };

  InlineType.prototype.valid = function valid (_, span) { return span.from < span.to };

  InlineType.prototype.eq = function eq (other) {
    return this == other ||
      (other instanceof InlineType && compareObjs(this.attrs, other.attrs) &&
       compareObjs(this.spec, other.spec))
  };

  InlineType.is = function is (span) { return span.type instanceof InlineType };

  var NodeType = function NodeType(attrs, spec) {
    this.spec = spec || noSpec;
    this.attrs = attrs;
  };

  NodeType.prototype.map = function map (mapping, span, offset, oldOffset) {
    var from = mapping.mapResult(span.from + oldOffset, 1);
    if (from.deleted) { return null }
    var to = mapping.mapResult(span.to + oldOffset, -1);
    if (to.deleted || to.pos <= from.pos) { return null }
    return new Decoration(from.pos - offset, to.pos - offset, this)
  };

  NodeType.prototype.valid = function valid (node, span) {
    var ref = node.content.findIndex(span.from);
      var index = ref.index;
      var offset = ref.offset;
    return offset == span.from && offset + node.child(index).nodeSize == span.to
  };

  NodeType.prototype.eq = function eq (other) {
    return this == other ||
      (other instanceof NodeType && compareObjs(this.attrs, other.attrs) &&
       compareObjs(this.spec, other.spec))
  };

  // ::- Decoration objects can be provided to the view through the
  // [`decorations` prop](#view.EditorProps.decorations). They come in
  // several variants—see the static members of this class for details.
  var Decoration = function Decoration(from, to, type) {
    // :: number
    // The start position of the decoration.
    this.from = from;
    // :: number
    // The end position. Will be the same as `from` for [widget
    // decorations](#view.Decoration^widget).
    this.to = to;
    this.type = type;
  };

  var prototypeAccessors$2 = { spec: {} };

  Decoration.prototype.copy = function copy (from, to) {
    return new Decoration(from, to, this.type)
  };

  Decoration.prototype.eq = function eq (other) {
    return this.type.eq(other.type) && this.from == other.from && this.to == other.to
  };

  Decoration.prototype.map = function map (mapping, offset, oldOffset) {
    return this.type.map(mapping, this, offset, oldOffset)
  };

  // :: (number, union<(view: EditorView, getPos: () → number) → dom.Node, dom.Node>, ?Object) → Decoration
  // Creates a widget decoration, which is a DOM node that's shown in
  // the document at the given position. It is recommended that you
  // delay rendering the widget by passing a function that will be
  // called when the widget is actually drawn in a view, but you can
  // also directly pass a DOM node. `getPos` can be used to find the
  // widget's current document position.
  //
  // spec::- These options are supported:
  //
  //   side:: ?number
  //   Controls which side of the document position this widget is
  //   associated with. When negative, it is drawn before a cursor
  //   at its position, and content inserted at that position ends
  //   up after the widget. When zero (the default) or positive, the
  //   widget is drawn after the cursor and content inserted there
  //   ends up before the widget.
  //
  //   When there are multiple widgets at a given position, their
  //   `side` values determine the order in which they appear. Those
  //   with lower values appear first. The ordering of widgets with
  //   the same `side` value is unspecified.
  //
  //   When `marks` is null, `side` also determines the marks that
  //   the widget is wrapped in—those of the node before when
  //   negative, those of the node after when positive.
  //
  //   marks:: ?[Mark]
  //   The precise set of marks to draw around the widget.
  //
  //   stopEvent:: ?(event: dom.Event) → bool
  //   Can be used to control which DOM events, when they bubble out
  //   of this widget, the editor view should ignore.
  //
  //   key:: ?string
  //   When comparing decorations of this type (in order to decide
  //   whether it needs to be redrawn), ProseMirror will by default
  //   compare the widget DOM node by identity. If you pass a key,
  //   that key will be compared instead, which can be useful when
  //   you generate decorations on the fly and don't want to store
  //   and reuse DOM nodes. Make sure that any widgets with the same
  //   key are interchangeable—if widgets differ in, for example,
  //   the behavior of some event handler, they should get
  //   different keys.
  Decoration.widget = function widget (pos, toDOM, spec) {
    return new Decoration(pos, pos, new WidgetType(toDOM, spec))
  };

  // :: (number, number, DecorationAttrs, ?Object) → Decoration
  // Creates an inline decoration, which adds the given attributes to
  // each inline node between `from` and `to`.
  //
  // spec::- These options are recognized:
  //
  //   inclusiveStart:: ?bool
  //   Determines how the left side of the decoration is
  //   [mapped](#transform.Position_Mapping) when content is
  //   inserted directly at that position. By default, the decoration
  //   won't include the new content, but you can set this to `true`
  //   to make it inclusive.
  //
  //   inclusiveEnd:: ?bool
  //   Determines how the right side of the decoration is mapped.
  //   See
  //   [`inclusiveStart`](#view.Decoration^inline^spec.inclusiveStart).
  Decoration.inline = function inline (from, to, attrs, spec) {
    return new Decoration(from, to, new InlineType(attrs, spec))
  };

  // :: (number, number, DecorationAttrs, ?Object) → Decoration
  // Creates a node decoration. `from` and `to` should point precisely
  // before and after a node in the document. That node, and only that
  // node, will receive the given attributes.
  Decoration.node = function node (from, to, attrs, spec) {
    return new Decoration(from, to, new NodeType(attrs, spec))
  };

  // :: Object
  // The spec provided when creating this decoration. Can be useful
  // if you've stored extra information in that object.
  prototypeAccessors$2.spec.get = function () { return this.type.spec };

  Object.defineProperties( Decoration.prototype, prototypeAccessors$2 );

  // DecorationAttrs:: interface
  // A set of attributes to add to a decorated node. Most properties
  // simply directly correspond to DOM attributes of the same name,
  // which will be set to the property's value. These are exceptions:
  //
  //   class:: ?string
  //   A CSS class name or a space-separated set of class names to be
  //   _added_ to the classes that the node already had.
  //
  //   style:: ?string
  //   A string of CSS to be _added_ to the node's existing `style` property.
  //
  //   nodeName:: ?string
  //   When non-null, the target node is wrapped in a DOM element of
  //   this type (and the other attributes are applied to this element).

  var none = [];
  var noSpec = {};

  // ::- A collection of [decorations](#view.Decoration), organized in
  // such a way that the drawing algorithm can efficiently use and
  // compare them. This is a persistent data structure—it is not
  // modified, updates create a new value.
  var DecorationSet = function DecorationSet(local, children) {
    this.local = local && local.length ? local : none;
    this.children = children && children.length ? children : none;
  };

  // :: (Node, [Decoration]) → DecorationSet
  // Create a set of decorations, using the structure of the given
  // document.
  DecorationSet.create = function create (doc, decorations) {
    return decorations.length ? buildTree(decorations, doc, 0, noSpec) : empty
  };

  // :: (?number, ?number, ?(spec: Object) → bool) → [Decoration]
  // Find all decorations in this set which touch the given range
  // (including decorations that start or end directly at the
  // boundaries) and match the given predicate on their spec. When
  // `start` and `end` are omitted, all decorations in the set are
  // considered. When `predicate` isn't given, all decorations are
  // asssumed to match.
  DecorationSet.prototype.find = function find (start, end, predicate) {
    var result = [];
    this.findInner(start == null ? 0 : start, end == null ? 1e9 : end, result, 0, predicate);
    return result
  };

  DecorationSet.prototype.findInner = function findInner (start, end, result, offset, predicate) {
      var this$1 = this;

    for (var i = 0; i < this.local.length; i++) {
      var span = this$1.local[i];
      if (span.from <= end && span.to >= start && (!predicate || predicate(span.spec)))
        { result.push(span.copy(span.from + offset, span.to + offset)); }
    }
    for (var i$1 = 0; i$1 < this.children.length; i$1 += 3) {
      if (this$1.children[i$1] < end && this$1.children[i$1 + 1] > start) {
        var childOff = this$1.children[i$1] + 1;
        this$1.children[i$1 + 2].findInner(start - childOff, end - childOff, result, offset + childOff, predicate);
      }
    }
  };

  // :: (Mapping, Node, ?Object) → DecorationSet
  // Map the set of decorations in response to a change in the
  // document.
  //
  // options::- An optional set of options.
  //
  //   onRemove:: ?(decorationSpec: Object)
  //   When given, this function will be called for each decoration
  //   that gets dropped as a result of the mapping, passing the
  //   spec of that decoration.
  DecorationSet.prototype.map = function map (mapping, doc, options) {
    if (this == empty || mapping.maps.length == 0) { return this }
    return this.mapInner(mapping, doc, 0, 0, options || noSpec)
  };

  DecorationSet.prototype.mapInner = function mapInner (mapping, node, offset, oldOffset, options) {
      var this$1 = this;

    var newLocal;
    for (var i = 0; i < this.local.length; i++) {
      var mapped = this$1.local[i].map(mapping, offset, oldOffset);
      if (mapped && mapped.type.valid(node, mapped)) { (newLocal || (newLocal = [])).push(mapped); }
      else if (options.onRemove) { options.onRemove(this$1.local[i].spec); }
    }

    if (this.children.length)
      { return mapChildren(this.children, newLocal, mapping, node, offset, oldOffset, options) }
    else
      { return newLocal ? new DecorationSet(newLocal.sort(byPos)) : empty }
  };

  // :: (Node, [Decoration]) → DecorationSet
  // Add the given array of decorations to the ones in the set,
  // producing a new set. Needs access to the current document to
  // create the appropriate tree structure.
  DecorationSet.prototype.add = function add (doc, decorations) {
    if (!decorations.length) { return this }
    if (this == empty) { return DecorationSet.create(doc, decorations) }
    return this.addInner(doc, decorations, 0)
  };

  DecorationSet.prototype.addInner = function addInner (doc, decorations, offset) {
      var this$1 = this;

    var children, childIndex = 0;
    doc.forEach(function (childNode, childOffset) {
      var baseOffset = childOffset + offset, found;
      if (!(found = takeSpansForNode(decorations, childNode, baseOffset))) { return }

      if (!children) { children = this$1.children.slice(); }
      while (childIndex < children.length && children[childIndex] < childOffset) { childIndex += 3; }
      if (children[childIndex] == childOffset)
        { children[childIndex + 2] = children[childIndex + 2].addInner(childNode, found, baseOffset + 1); }
      else
        { children.splice(childIndex, 0, childOffset, childOffset + childNode.nodeSize, buildTree(found, childNode, baseOffset + 1, noSpec)); }
      childIndex += 3;
    });

    var local = moveSpans(childIndex ? withoutNulls(decorations) : decorations, -offset);
    return new DecorationSet(local.length ? this.local.concat(local).sort(byPos) : this.local,
                             children || this.children)
  };

  // :: ([Decoration]) → DecorationSet
  // Create a new set that contains the decorations in this set, minus
  // the ones in the given array.
  DecorationSet.prototype.remove = function remove (decorations) {
    if (decorations.length == 0 || this == empty) { return this }
    return this.removeInner(decorations, 0)
  };

  DecorationSet.prototype.removeInner = function removeInner (decorations, offset) {
      var this$1 = this;

    var children = this.children, local = this.local;
    for (var i = 0; i < children.length; i += 3) {
      var found = (void 0), from = children[i] + offset, to = children[i + 1] + offset;
      for (var j = 0, span = (void 0); j < decorations.length; j++) { if (span = decorations[j]) {
        if (span.from > from && span.to < to) {
          decorations[j] = null
          ;(found || (found = [])).push(span);
        }
      } }
      if (!found) { continue }
      if (children == this$1.children) { children = this$1.children.slice(); }
      var removed = children[i + 2].removeInner(found, from + 1);
      if (removed != empty) {
        children[i + 2] = removed;
      } else {
        children.splice(i, 3);
        i -= 3;
      }
    }
    if (local.length) { for (var i$1 = 0, span$1 = (void 0); i$1 < decorations.length; i$1++) { if (span$1 = decorations[i$1]) {
      for (var j$1 = 0; j$1 < local.length; j$1++) { if (local[j$1].type.eq(span$1.type)) {
        if (local == this$1.local) { local = this$1.local.slice(); }
        local.splice(j$1--, 1);
      } }
    } } }
    if (children == this.children && local == this.local) { return this }
    return local.length || children.length ? new DecorationSet(local, children) : empty
  };

  DecorationSet.prototype.forChild = function forChild (offset, node) {
      var this$1 = this;

    if (this == empty) { return this }
    if (node.isLeaf) { return DecorationSet.empty }

    var child, local;
    for (var i = 0; i < this.children.length; i += 3) { if (this$1.children[i] >= offset) {
      if (this$1.children[i] == offset) { child = this$1.children[i + 2]; }
      break
    } }
    var start = offset + 1, end = start + node.content.size;
    for (var i$1 = 0; i$1 < this.local.length; i$1++) {
      var dec = this$1.local[i$1];
      if (dec.from < end && dec.to > start && (dec.type instanceof InlineType)) {
        var from = Math.max(start, dec.from) - start, to = Math.min(end, dec.to) - start;
        if (from < to) { (local || (local = [])).push(dec.copy(from, to)); }
      }
    }
    if (local) {
      var localSet = new DecorationSet(local.sort(byPos));
      return child ? new DecorationGroup([localSet, child]) : localSet
    }
    return child || empty
  };

  DecorationSet.prototype.eq = function eq (other) {
      var this$1 = this;

    if (this == other) { return true }
    if (!(other instanceof DecorationSet) ||
        this.local.length != other.local.length ||
        this.children.length != other.children.length) { return false }
    for (var i = 0; i < this.local.length; i++)
      { if (!this$1.local[i].eq(other.local[i])) { return false } }
    for (var i$1 = 0; i$1 < this.children.length; i$1 += 3)
      { if (this$1.children[i$1] != other.children[i$1] ||
          this$1.children[i$1 + 1] != other.children[i$1 + 1] ||
          !this$1.children[i$1 + 2].eq(other.children[i$1 + 2])) { return false } }
    return false
  };

  DecorationSet.prototype.locals = function locals (node) {
    return removeOverlap(this.localsInner(node))
  };

  DecorationSet.prototype.localsInner = function localsInner (node) {
      var this$1 = this;

    if (this == empty) { return none }
    if (node.inlineContent || !this.local.some(InlineType.is)) { return this.local }
    var result = [];
    for (var i = 0; i < this.local.length; i++) {
      if (!(this$1.local[i].type instanceof InlineType))
        { result.push(this$1.local[i]); }
    }
    return result
  };

  var empty = new DecorationSet();

  // :: DecorationSet
  // The empty set of decorations.
  DecorationSet.empty = empty;

  DecorationSet.removeOverlap = removeOverlap;

  // :- An abstraction that allows the code dealing with decorations to
  // treat multiple DecorationSet objects as if it were a single object
  // with (a subset of) the same interface.
  var DecorationGroup = function DecorationGroup(members) {
    this.members = members;
  };

  DecorationGroup.prototype.forChild = function forChild (offset, child) {
      var this$1 = this;

    if (child.isLeaf) { return DecorationSet.empty }
    var found = [];
    for (var i = 0; i < this.members.length; i++) {
      var result = this$1.members[i].forChild(offset, child);
      if (result == empty) { continue }
      if (result instanceof DecorationGroup) { found = found.concat(result.members); }
      else { found.push(result); }
    }
    return DecorationGroup.from(found)
  };

  DecorationGroup.prototype.eq = function eq (other) {
      var this$1 = this;

    if (!(other instanceof DecorationGroup) ||
        other.members.length != this.members.length) { return false }
    for (var i = 0; i < this.members.length; i++)
      { if (!this$1.members[i].eq(other.members[i])) { return false } }
    return true
  };

  DecorationGroup.prototype.locals = function locals (node) {
      var this$1 = this;

    var result, sorted = true;
    for (var i = 0; i < this.members.length; i++) {
      var locals = this$1.members[i].localsInner(node);
      if (!locals.length) { continue }
      if (!result) {
        result = locals;
      } else {
        if (sorted) {
          result = result.slice();
          sorted = false;
        }
        for (var j = 0; j < locals.length; j++) { result.push(locals[j]); }
      }
    }
    return result ? removeOverlap(sorted ? result : result.sort(byPos)) : none
  };

  // : ([DecorationSet]) → union<DecorationSet, DecorationGroup>
  // Create a group for the given array of decoration sets, or return
  // a single set when possible.
  DecorationGroup.from = function from (members) {
    switch (members.length) {
      case 0: return empty
      case 1: return members[0]
      default: return new DecorationGroup(members)
    }
  };

  function mapChildren(oldChildren, newLocal, mapping, node, offset, oldOffset, options) {
    var children = oldChildren.slice();

    // Mark the children that are directly touched by changes, and
    // move those that are after the changes.
    var shift = function (oldStart, oldEnd, newStart, newEnd) {
      for (var i = 0; i < children.length; i += 3) {
        var end = children[i + 1], dSize = (void 0);
        if (end == -1 || oldStart > end + oldOffset) { continue }
        if (oldEnd >= children[i] + oldOffset) {
          children[i + 1] = -1;
        } else if (dSize = (newEnd - newStart) - (oldEnd - oldStart) + (oldOffset - offset)) {
          children[i] += dSize;
          children[i + 1] += dSize;
        }
      }
    };
    for (var i = 0; i < mapping.maps.length; i++) { mapping.maps[i].forEach(shift); }

    // Find the child nodes that still correspond to a single node,
    // recursively call mapInner on them and update their positions.
    var mustRebuild = false;
    for (var i$1 = 0; i$1 < children.length; i$1 += 3) { if (children[i$1 + 1] == -1) { // Touched nodes
      var from = mapping.map(children[i$1] + oldOffset), fromLocal = from - offset;
      if (fromLocal < 0 || fromLocal >= node.content.size) {
        mustRebuild = true;
        continue
      }
      // Must read oldChildren because children was tagged with -1
      var to = mapping.map(oldChildren[i$1 + 1] + oldOffset, -1), toLocal = to - offset;
      var ref = node.content.findIndex(fromLocal);
      var index = ref.index;
      var childOffset = ref.offset;
      var childNode = node.maybeChild(index);
      if (childNode && childOffset == fromLocal && childOffset + childNode.nodeSize == toLocal) {
        var mapped = children[i$1 + 2].mapInner(mapping, childNode, from + 1, children[i$1] + oldOffset + 1, options);
        if (mapped != empty) {
          children[i$1] = fromLocal;
          children[i$1 + 1] = toLocal;
          children[i$1 + 2] = mapped;
        } else {
          children[i$1 + 1] = -2;
          mustRebuild = true;
        }
      } else {
        mustRebuild = true;
      }
    } }

    // Remaining children must be collected and rebuilt into the appropriate structure
    if (mustRebuild) {
      var decorations = mapAndGatherRemainingDecorations(children, oldChildren, newLocal || [], mapping,
                                                         offset, oldOffset, options);
      var built = buildTree(decorations, node, 0, options);
      newLocal = built.local;
      for (var i$2 = 0; i$2 < children.length; i$2 += 3) { if (children[i$2 + 1] < 0) {
        children.splice(i$2, 3);
        i$2 -= 3;
      } }
      for (var i$3 = 0, j = 0; i$3 < built.children.length; i$3 += 3) {
        var from$1 = built.children[i$3];
        while (j < children.length && children[j] < from$1) { j += 3; }
        children.splice(j, 0, built.children[i$3], built.children[i$3 + 1], built.children[i$3 + 2]);
      }
    }

    return new DecorationSet(newLocal && newLocal.sort(byPos), children)
  }

  function moveSpans(spans, offset) {
    if (!offset || !spans.length) { return spans }
    var result = [];
    for (var i = 0; i < spans.length; i++) {
      var span = spans[i];
      result.push(new Decoration(span.from + offset, span.to + offset, span.type));
    }
    return result
  }

  function mapAndGatherRemainingDecorations(children, oldChildren, decorations, mapping, offset, oldOffset, options) {
    // Gather all decorations from the remaining marked children
    function gather(set, oldOffset) {
      for (var i = 0; i < set.local.length; i++) {
        var mapped = set.local[i].map(mapping, offset, oldOffset);
        if (mapped) { decorations.push(mapped); }
        else if (options.onRemove) { options.onRemove(set.local[i].spec); }
      }
      for (var i$1 = 0; i$1 < set.children.length; i$1 += 3)
        { gather(set.children[i$1 + 2], set.children[i$1] + oldOffset + 1); }
    }
    for (var i = 0; i < children.length; i += 3) { if (children[i + 1] == -1)
      { gather(children[i + 2], oldChildren[i] + oldOffset + 1); } }

    return decorations
  }

  function takeSpansForNode(spans, node, offset) {
    if (node.isLeaf) { return null }
    var end = offset + node.nodeSize, found = null;
    for (var i = 0, span = (void 0); i < spans.length; i++) {
      if ((span = spans[i]) && span.from > offset && span.to < end) {
        (found || (found = [])).push(span);
        spans[i] = null;
      }
    }
    return found
  }

  function withoutNulls(array) {
    var result = [];
    for (var i = 0; i < array.length; i++)
      { if (array[i] != null) { result.push(array[i]); } }
    return result
  }

  // : ([Decoration], Node, number) → DecorationSet
  // Build up a tree that corresponds to a set of decorations. `offset`
  // is a base offset that should be subtractet from the `from` and `to`
  // positions in the spans (so that we don't have to allocate new spans
  // for recursive calls).
  function buildTree(spans, node, offset, options) {
    var children = [], hasNulls = false;
    node.forEach(function (childNode, localStart) {
      var found = takeSpansForNode(spans, childNode, localStart + offset);
      if (found) {
        hasNulls = true;
        var subtree = buildTree(found, childNode, offset + localStart + 1, options);
        if (subtree != empty)
          { children.push(localStart, localStart + childNode.nodeSize, subtree); }
      }
    });
    var locals = moveSpans(hasNulls ? withoutNulls(spans) : spans, -offset).sort(byPos);
    for (var i = 0; i < locals.length; i++) { if (!locals[i].type.valid(node, locals[i])) {
      if (options.onRemove) { options.onRemove(locals[i].spec); }
      locals.splice(i--, 1);
    } }
    return locals.length || children.length ? new DecorationSet(locals, children) : empty
  }

  // : (Decoration, Decoration) → number
  // Used to sort decorations so that ones with a low start position
  // come first, and within a set with the same start position, those
  // with an smaller end position come first.
  function byPos(a, b) {
    return a.from - b.from || a.to - b.to
  }

  // : ([Decoration]) → [Decoration]
  // Scan a sorted array of decorations for partially overlapping spans,
  // and split those so that only fully overlapping spans are left (to
  // make subsequent rendering easier). Will return the input array if
  // no partially overlapping spans are found (the common case).
  function removeOverlap(spans) {
    var working = spans;
    for (var i = 0; i < working.length - 1; i++) {
      var span = working[i];
      if (span.from != span.to) { for (var j = i + 1; j < working.length; j++) {
        var next = working[j];
        if (next.from == span.from) {
          if (next.to != span.to) {
            if (working == spans) { working = spans.slice(); }
            // Followed by a partially overlapping larger span. Split that
            // span.
            working[j] = next.copy(next.from, span.to);
            insertAhead(working, j + 1, next.copy(span.to, next.to));
          }
          continue
        } else {
          if (next.from < span.to) {
            if (working == spans) { working = spans.slice(); }
            // The end of this one overlaps with a subsequent span. Split
            // this one.
            working[i] = span.copy(span.from, next.from);
            insertAhead(working, j, span.copy(next.from, span.to));
          }
          break
        }
      } }
    }
    return working
  }

  function insertAhead(array, i, deco) {
    while (i < array.length && byPos(deco, array[i]) > 0) { i++; }
    array.splice(i, 0, deco);
  }

  // : (EditorView) → union<DecorationSet, DecorationGroup>
  // Get the decorations associated with the current props of a view.
  function viewDecorations(view) {
    var found = [];
    view.someProp("decorations", function (f) {
      var result = f(view.state);
      if (result && result != empty) { found.push(result); }
    });
    if (view.cursorWrapper)
      { found.push(DecorationSet.create(view.state.doc, [view.cursorWrapper.deco])); }
    return DecorationGroup.from(found)
  }

  // ::- An editor view manages the DOM structure that represents an
  // editable document. Its state and behavior are determined by its
  // [props](#view.DirectEditorProps).
  var EditorView = function EditorView(place, props) {
    this._props = props;
    // :: EditorState
    // The view's current [state](#state.EditorState).
    this.state = props.state;

    this.dispatch = this.dispatch.bind(this);

    this._root = null;
    this.focused = false;

    // :: dom.Element
    // An editable DOM node containing the document. (You probably
    // should not directly interfere with its content.)
    this.dom = (place && place.mount) || document.createElement("div");
    if (place) {
      if (place.appendChild) { place.appendChild(this.dom); }
      else if (place.apply) { place(this.dom); }
      else if (place.mount) { this.mounted = true; }
    }

    this.editable = getEditable(this);
    this.cursorWrapper = null;
    updateCursorWrapper(this);
    this.nodeViews = buildNodeViews(this);
    this.docView = docViewDesc(this.state.doc, computeDocDeco(this), viewDecorations(this), this.dom, this);

    this.lastSelectedViewDesc = null;
    // :: ?{slice: Slice, move: bool}
    // When editor content is being dragged, this object contains
    // information about the dragged slice and whether it is being
    // copied or moved. At any other time, it is null.
    this.dragging = null;

    initInput(this);

    this.pluginViews = [];
    this.updatePluginViews();
  };

  var prototypeAccessors = { props: {},root: {} };

  // composing:: boolean
  // Holds `true` when a
  // [composition](https://developer.mozilla.org/en-US/docs/Mozilla/IME_handling_guide)
  // is active.

  // :: DirectEditorProps
  // The view's current [props](#view.EditorProps).
  prototypeAccessors.props.get = function () {
      var this$1 = this;

    if (this._props.state != this.state) {
      var prev = this._props;
      this._props = {};
      for (var name in prev) { this$1._props[name] = prev[name]; }
      this._props.state = this.state;
    }
    return this._props
  };

  // :: (DirectEditorProps)
  // Update the view's props. Will immediately cause an update to
  // the DOM.
  EditorView.prototype.update = function update (props) {
    if (props.handleDOMEvents != this._props.handleDOMEvents) { ensureListeners(this); }
    this._props = props;
    this.updateStateInner(props.state, true);
  };

  // :: (DirectEditorProps)
  // Update the view by updating existing props object with the object
  // given as argument. Equivalent to `view.update(Object.assign({},
  // view.props, props))`.
  EditorView.prototype.setProps = function setProps (props) {
      var this$1 = this;

    var updated = {};
    for (var name in this$1._props) { updated[name] = this$1._props[name]; }
    updated.state = this.state;
    for (var name$1 in props) { updated[name$1] = props[name$1]; }
    this.update(updated);
  };

  // :: (EditorState)
  // Update the editor's `state` prop, without touching any of the
  // other props.
  EditorView.prototype.updateState = function updateState (state) {
    this.updateStateInner(state, this.state.plugins != state.plugins);
  };

  EditorView.prototype.updateStateInner = function updateStateInner (state, reconfigured) {
      var this$1 = this;

    var prev = this.state, redraw = false;
    this.state = state;
    if (reconfigured) {
      var nodeViews = buildNodeViews(this);
      if (changedNodeViews(nodeViews, this.nodeViews)) {
        this.nodeViews = nodeViews;
        redraw = true;
      }
      ensureListeners(this);
    }

    this.editable = getEditable(this);
    updateCursorWrapper(this);
    var innerDeco = viewDecorations(this), outerDeco = computeDocDeco(this);

    var scroll = reconfigured ? "reset"
        : state.scrollToSelection > prev.scrollToSelection ? "to selection" : "preserve";
    var updateDoc = redraw || !this.docView.matchesNode(state.doc, outerDeco, innerDeco);
    var updateSel = updateDoc || !state.selection.eq(prev.selection);
    var oldScrollPos = scroll == "preserve" && updateSel && this.dom.style.overflowAnchor == null && storeScrollPos(this);

    if (updateSel) {
      this.domObserver.stop();
      var forceSelUpdate = false;
      if (updateDoc) {
        // Work around an issue in Chrome where changing the DOM
        // around the active selection puts it into a broken state
        // where the thing the user sees differs from the selection
        // reported by the Selection object (#710)
        var startSelContext = result.chrome && selectionContext(this.root);
        if (redraw || !this.docView.update(state.doc, outerDeco, innerDeco, this)) {
          this.docView.destroy();
          this.docView = docViewDesc(state.doc, outerDeco, innerDeco, this.dom, this);
        }
        if (startSelContext)
          { forceSelUpdate = needChromeSelectionForce(startSelContext, this.root); }
      }
      // Work around for an issue where an update arriving right between
      // a DOM selection change and the "selectionchange" event for it
      // can cause a spurious DOM selection update, disrupting mouse
      // drag selection.
      if (forceSelUpdate ||
          !(this.mouseDown && this.domObserver.currentSelection.eq(this.root.getSelection()) && anchorInRightPlace(this))) {
        selectionToDOM(this, false, forceSelUpdate);
      } else {
        syncNodeSelection(this, state.selection);
        this.domObserver.setCurSelection();
      }
      this.domObserver.start();
    }

    this.updatePluginViews(prev);

    if (scroll == "reset") {
      this.dom.scrollTop = 0;
    } else if (scroll == "to selection") {
      var startDOM = this.root.getSelection().focusNode;
      if (this.someProp("handleScrollToSelection", function (f) { return f(this$1); }))
        ; // Handled
      else if (state.selection instanceof dist$3.NodeSelection)
        { scrollRectIntoView(this, this.docView.domAfterPos(state.selection.from).getBoundingClientRect(), startDOM); }
      else
        { scrollRectIntoView(this, this.coordsAtPos(state.selection.head), startDOM); }
    } else if (oldScrollPos) {
      resetScrollPos(oldScrollPos);
    }
  };

  EditorView.prototype.destroyPluginViews = function destroyPluginViews () {
    var view;
    while (view = this.pluginViews.pop()) { if (view.destroy) { view.destroy(); } }
  };

  EditorView.prototype.updatePluginViews = function updatePluginViews (prevState) {
      var this$1 = this;

    if (!prevState || prevState.plugins != this.state.plugins) {
      this.destroyPluginViews();
      for (var i = 0; i < this.state.plugins.length; i++) {
        var plugin = this$1.state.plugins[i];
        if (plugin.spec.view) { this$1.pluginViews.push(plugin.spec.view(this$1)); }
      }
    } else {
      for (var i$1 = 0; i$1 < this.pluginViews.length; i$1++) {
        var pluginView = this$1.pluginViews[i$1];
        if (pluginView.update) { pluginView.update(this$1, prevState); }
      }
    }
  };

  // :: (string, ?(prop: *) → *) → *
  // Goes over the values of a prop, first those provided directly,
  // then those from plugins (in order), and calls `f` every time a
  // non-undefined value is found. When `f` returns a truthy value,
  // that is immediately returned. When `f` isn't provided, it is
  // treated as the identity function (the prop value is returned
  // directly).
  EditorView.prototype.someProp = function someProp (propName, f) {
    var prop = this._props && this._props[propName], value;
    if (prop != null && (value = f ? f(prop) : prop)) { return value }
    var plugins = this.state.plugins;
    if (plugins) { for (var i = 0; i < plugins.length; i++) {
      var prop$1 = plugins[i].props[propName];
      if (prop$1 != null && (value = f ? f(prop$1) : prop$1)) { return value }
    } }
  };

  // :: () → bool
  // Query whether the view has focus.
  EditorView.prototype.hasFocus = function hasFocus () {
    return this.root.activeElement == this.dom
  };

  // :: ()
  // Focus the editor.
  EditorView.prototype.focus = function focus () {
    this.domObserver.stop();
    selectionToDOM(this, true);
    this.domObserver.start();
    if (this.editable) { this.dom.focus(); }
  };

  // :: union<dom.Document, dom.DocumentFragment>
  // Get the document root in which the editor exists. This will
  // usually be the top-level `document`, but might be a [shadow
  // DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Shadow_DOM)
  // root if the editor is inside one.
  prototypeAccessors.root.get = function () {
      var this$1 = this;

    var cached = this._root;
    if (cached == null) { for (var search = this.dom.parentNode; search; search = search.parentNode) {
      if (search.nodeType == 9 || (search.nodeType == 11 && search.host))
        { return this$1._root = search }
    } }
    return cached || document
  };

  // :: ({left: number, top: number}) → ?{pos: number, inside: number}
  // Given a pair of viewport coordinates, return the document
  // position that corresponds to them. May return null if the given
  // coordinates aren't inside of the editor. When an object is
  // returned, its `pos` property is the position nearest to the
  // coordinates, and its `inside` property holds the position of the
  // inner node that the position falls inside of, or -1 if it is at
  // the top level, not in any node.
  EditorView.prototype.posAtCoords = function posAtCoords$1 (coords) {
    return posAtCoords(this, coords)
  };

  // :: (number) → {left: number, right: number, top: number, bottom: number}
  // Returns the viewport rectangle at a given document position. `left`
  // and `right` will be the same number, as this returns a flat
  // cursor-ish rectangle.
  EditorView.prototype.coordsAtPos = function coordsAtPos$1 (pos) {
    return coordsAtPos(this, pos)
  };

  // :: (number) → {node: dom.Node, offset: number}
  // Find the DOM position that corresponds to the given document
  // position. Note that you should **not** mutate the editor's
  // internal DOM, only inspect it (and even that is usually not
  // necessary).
  EditorView.prototype.domAtPos = function domAtPos (pos) {
    return this.docView.domFromPos(pos)
  };

  // :: (number) → ?dom.Node
  // Find the DOM node that represents the document node after the
  // given position. May return `null` when the position doesn't point
  // in front of a node or if the node is inside an opaque node view.
  //
  // This is intended to be able to call things like
  // `getBoundingClientRect` on that DOM node. Do **not** mutate the
  // editor DOM directly, or add styling this way, since that will be
  // immediately overriden by the editor as it redraws the node.
  EditorView.prototype.nodeDOM = function nodeDOM (pos) {
    var desc = this.docView.descAt(pos);
    return desc ? desc.nodeDOM : null
  };

  // :: (dom.Node, number, ?number) → number
  // Find the document position that corresponds to a given DOM
  // position. (Whenever possible, it is preferable to inspect the
  // document structure directly, rather than poking around in the
  // DOM, but sometimes—for example when interpreting an event
  // target—you don't have a choice.)
  //
  // The `bias` parameter can be used to influence which side of a DOM
  // node to use when the position is inside a leaf node.
  EditorView.prototype.posAtDOM = function posAtDOM (node, offset, bias) {
      if ( bias === void 0 ) bias = -1;

    var pos = this.docView.posFromDOM(node, offset, bias);
    if (pos == null) { throw new RangeError("DOM position not inside the editor") }
    return pos
  };

  // :: (union<"up", "down", "left", "right", "forward", "backward">, ?EditorState) → bool
  // Find out whether the selection is at the end of a textblock when
  // moving in a given direction. When, for example, given `"left"`,
  // it will return true if moving left from the current cursor
  // position would leave that position's parent textblock. Will apply
  // to the view's current state by default, but it is possible to
  // pass a different state.
  EditorView.prototype.endOfTextblock = function endOfTextblock$1 (dir, state) {
    return endOfTextblock(this, state || this.state, dir)
  };

  // :: ()
  // Removes the editor from the DOM and destroys all [node
  // views](#view.NodeView).
  EditorView.prototype.destroy = function destroy () {
    if (!this.docView) { return }
    destroyInput(this);
    this.destroyPluginViews();
    if (this.mounted) {
      this.docView.update(this.state.doc, [], viewDecorations(this), this);
      this.dom.textContent = "";
    } else if (this.dom.parentNode) {
      this.dom.parentNode.removeChild(this.dom);
    }
    this.docView.destroy();
    this.docView = null;
  };

  // Used for testing.
  EditorView.prototype.dispatchEvent = function dispatchEvent$1 (event) {
    return dispatchEvent(this, event)
  };

  // :: (Transaction)
  // Dispatch a transaction. Will call
  // [`dispatchTransaction`](#view.DirectEditorProps.dispatchTransaction)
  // when given, and otherwise defaults to applying the transaction to
  // the current state and calling
  // [`updateState`](#view.EditorView.updateState) with the result.
  // This method is bound to the view instance, so that it can be
  // easily passed around.
  EditorView.prototype.dispatch = function dispatch (tr) {
    var dispatchTransaction = this._props.dispatchTransaction;
    if (dispatchTransaction) { dispatchTransaction.call(this, tr); }
    else { this.updateState(this.state.apply(tr)); }
  };

  Object.defineProperties( EditorView.prototype, prototypeAccessors );

  function computeDocDeco(view) {
    var attrs = Object.create(null);
    attrs.class = "ProseMirror";
    attrs.contenteditable = String(view.editable);

    view.someProp("attributes", function (value) {
      if (typeof value == "function") { value = value(view.state); }
      if (value) { for (var attr in value) {
        if (attr == "class")
          { attrs.class += " " + value[attr]; }
        else if (!attrs[attr] && attr != "contenteditable" && attr != "nodeName")
          { attrs[attr] = String(value[attr]); }
      } }
    });

    return [Decoration.node(0, view.state.doc.content.size, attrs)]
  }

  function cursorWrapperDOM(visible) {
    var span = document.createElement("span");
    span.textContent = "\ufeff"; // zero-width non-breaking space
    if (!visible) {
      span.style.position = "absolute";
      span.style.left = "-100000px";
    }
    return span
  }

  function updateCursorWrapper(view) {
    var $pos = needsCursorWrapper(view.state);
    // On IE/Edge, moving the DOM selection will abort a mouse drag, so
    // there we delay the creation of the wrapper when the mouse is down.
    if ($pos && !(result.ie && view.mouseDown)) {
      var visible = view.state.selection.visible;
      // Needs a cursor wrapper
      var marks = view.state.storedMarks || $pos.marks(), dom;
      if (!view.cursorWrapper || !dist.Mark.sameSet(view.cursorWrapper.deco.spec.marks, marks) ||
          view.cursorWrapper.dom.textContent != "\ufeff" ||
          view.cursorWrapper.deco.spec.visible != visible)
        { dom = cursorWrapperDOM(visible); }
      else if (view.cursorWrapper.deco.pos != $pos.pos)
        { dom = view.cursorWrapper.dom; }
      if (dom)
        { view.cursorWrapper = {dom: dom, deco: Decoration.widget($pos.pos, dom, {isCursorWrapper: true, marks: marks, raw: true, visible: visible})}; }
    } else {
      view.cursorWrapper = null;
    }
  }

  function getEditable(view) {
    return !view.someProp("editable", function (value) { return value(view.state) === false; })
  }

  function selectionContext(root) {
    var ref = root.getSelection();
    var offset = ref.focusOffset;
    var node = ref.focusNode;
    if (!node || node.nodeType == 3) { return null }
    return [node, offset,
            node.nodeType == 1 ? node.childNodes[offset - 1] : null,
            node.nodeType == 1 ? node.childNodes[offset] : null]
  }

  function needChromeSelectionForce(context, root) {
    var newContext = selectionContext(root);
    if (!newContext || newContext[0].nodeType == 3) { return false }
    for (var i = 0; i < context.length; i++) { if (newContext[i] != context[i]) { return true } }
    return false
  }

  function buildNodeViews(view) {
    var result$$1 = {};
    view.someProp("nodeViews", function (obj) {
      for (var prop in obj) { if (!Object.prototype.hasOwnProperty.call(result$$1, prop))
        { result$$1[prop] = obj[prop]; } }
    });
    return result$$1
  }

  function changedNodeViews(a, b) {
    var nA = 0, nB = 0;
    for (var prop in a) {
      if (a[prop] != b[prop]) { return true }
      nA++;
    }
    for (var _ in b) { nB++; }
    return nA != nB
  }

  // EditorProps:: interface
  //
  // Props are configuration values that can be passed to an editor view
  // or included in a plugin. This interface lists the supported props.
  //
  // The various event-handling functions may all return `true` to
  // indicate that they handled the given event. The view will then take
  // care to call `preventDefault` on the event, except with
  // `handleDOMEvents`, where the handler itself is responsible for that.
  //
  // How a prop is resolved depends on the prop. Handler functions are
  // called one at a time, starting with the base props and then
  // searching through the plugins (in order of appearance) until one of
  // them returns true. For some props, the first plugin that yields a
  // value gets precedence.
  //
  //   handleDOMEvents:: ?Object<(view: EditorView, event: dom.Event) → bool>
  //   Can be an object mapping DOM event type names to functions that
  //   handle them. Such functions will be called before any handling
  //   ProseMirror does of events fired on the editable DOM element.
  //   Contrary to the other event handling props, when returning true
  //   from such a function, you are responsible for calling
  //   `preventDefault` yourself (or not, if you want to allow the
  //   default behavior).
  //
  //   handleKeyDown:: ?(view: EditorView, event: dom.KeyboardEvent) → bool
  //   Called when the editor receives a `keydown` event.
  //
  //   handleKeyPress:: ?(view: EditorView, event: dom.KeyboardEvent) → bool
  //   Handler for `keypress` events.
  //
  //   handleTextInput:: ?(view: EditorView, from: number, to: number, text: string) → bool
  //   Whenever the user directly input text, this handler is called
  //   before the input is applied. If it returns `true`, the default
  //   behavior of actually inserting the text is suppressed.
  //
  //   handleClickOn:: ?(view: EditorView, pos: number, node: Node, nodePos: number, event: dom.MouseEvent, direct: bool) → bool
  //   Called for each node around a click, from the inside out. The
  //   `direct` flag will be true for the inner node.
  //
  //   handleClick:: ?(view: EditorView, pos: number, event: dom.MouseEvent) → bool
  //   Called when the editor is clicked, after `handleClickOn` handlers
  //   have been called.
  //
  //   handleDoubleClickOn:: ?(view: EditorView, pos: number, node: Node, nodePos: number, event: dom.MouseEvent, direct: bool) → bool
  //   Called for each node around a double click.
  //
  //   handleDoubleClick:: ?(view: EditorView, pos: number, event: dom.MouseEvent) → bool
  //   Called when the editor is double-clicked, after `handleDoubleClickOn`.
  //
  //   handleTripleClickOn:: ?(view: EditorView, pos: number, node: Node, nodePos: number, event: dom.MouseEvent, direct: bool) → bool
  //   Called for each node around a triple click.
  //
  //   handleTripleClick:: ?(view: EditorView, pos: number, event: dom.MouseEvent) → bool
  //   Called when the editor is triple-clicked, after `handleTripleClickOn`.
  //
  //   handlePaste:: ?(view: EditorView, event: dom.Event, slice: Slice) → bool
  //   Can be used to override the behavior of pasting. `slice` is the
  //   pasted content parsed by the editor, but you can directly access
  //   the event to get at the raw content.
  //
  //   handleDrop:: ?(view: EditorView, event: dom.Event, slice: Slice, moved: bool) → bool
  //   Called when something is dropped on the editor. `moved` will be
  //   true if this drop moves from the current selection (which should
  //   thus be deleted).
  //
  //   handleScrollToSelection:: ?(view: EditorView) → bool
  //   Called when the view, after updating its state, tries to scroll
  //   the selection into view. A handler function may return false to
  //   indicate that it did not handle the scrolling and further
  //   handlers or the default behavior should be tried.
  //
  //   createSelectionBetween:: ?(view: EditorView, anchor: ResolvedPos, head: ResolvedPos) → ?Selection
  //   Can be used to override the way a selection is created when
  //   reading a DOM selection between the given anchor and head.
  //
  //   domParser:: ?DOMParser
  //   The [parser](#model.DOMParser) to use when reading editor changes
  //   from the DOM. Defaults to calling
  //   [`DOMParser.fromSchema`](#model.DOMParser^fromSchema) on the
  //   editor's schema.
  //
  //   transformPastedHTML:: ?(html: string) → string
  //   Can be used to transform pasted HTML text, _before_ it is parsed,
  //   for example to clean it up.
  //
  //   clipboardParser:: ?DOMParser
  //   The [parser](#model.DOMParser) to use when reading content from
  //   the clipboard. When not given, the value of the
  //   [`domParser`](#view.EditorProps.domParser) prop is used.
  //
  //   transformPastedText:: ?(text: string) → string
  //   Transform pasted plain text.
  //
  //   clipboardTextParser:: ?(text: string, $context: ResolvedPos) → Slice
  //   A function to parse text from the clipboard into a document
  //   slice. Called after
  //   [`transformPastedText`](#view.EditorProps.transformPastedText).
  //   The default behavior is to split the text into lines, wrap them
  //   in `<p>` tags, and call
  //   [`clipboardParser`](#view.EditorProps.clipboardParser) on it.
  //
  //   transformPasted:: ?(Slice) → Slice
  //   Can be used to transform pasted content before it is applied to
  //   the document.
  //
  //   nodeViews:: ?Object<(node: Node, view: EditorView, getPos: () → number, decorations: [Decoration]) → NodeView>
  //   Allows you to pass custom rendering and behavior logic for nodes
  //   and marks. Should map node and mark names to constructor
  //   functions that produce a [`NodeView`](#view.NodeView) object
  //   implementing the node's display behavior. For nodes, the third
  //   argument `getPos` is a function that can be called to get the
  //   node's current position, which can be useful when creating
  //   transactions to update it. For marks, the third argument is a
  //   boolean that indicates whether the mark's content is inline.
  //
  //   `decorations` is an array of node or inline decorations that are
  //   active around the node. They are automatically drawn in the
  //   normal way, and you will usually just want to ignore this, but
  //   they can also be used as a way to provide context information to
  //   the node view without adding it to the document itself.
  //
  //   clipboardSerializer:: ?DOMSerializer
  //   The DOM serializer to use when putting content onto the
  //   clipboard. If not given, the result of
  //   [`DOMSerializer.fromSchema`](#model.DOMSerializer^fromSchema)
  //   will be used.
  //
  //   clipboardTextSerializer:: ?(Slice) → string
  //   A function that will be called to get the text for the current
  //   selection when copying text to the clipboard. By default, the
  //   editor will use [`textBetween`](#model.Node.textBetween) on the
  //   selected range.
  //
  //   decorations:: ?(state: EditorState) → ?DecorationSet
  //   A set of [document decorations](#view.Decoration) to show in the
  //   view.
  //
  //   editable:: ?(state: EditorState) → bool
  //   When this returns false, the content of the view is not directly
  //   editable.
  //
  //   attributes:: ?union<Object<string>, (EditorState) → ?Object<string>>
  //   Control the DOM attributes of the editable element. May be either
  //   an object or a function going from an editor state to an object.
  //   By default, the element will get a class `"ProseMirror"`, and
  //   will have its `contentEditable` attribute determined by the
  //   [`editable` prop](#view.EditorProps.editable). Additional classes
  //   provided here will be added to the class. For other attributes,
  //   the value provided first (as in
  //   [`someProp`](#view.EditorView.someProp)) will be used.
  //
  //   scrollThreshold:: ?union<number, {top: number, right: number, bottom: number, left: number}>
  //   Determines the distance (in pixels) between the cursor and the
  //   end of the visible viewport at which point, when scrolling the
  //   cursor into view, scrolling takes place. Defaults to 0.
  //
  //   scrollMargin:: ?union<number, {top: number, right: number, bottom: number, left: number}>
  //   Determines the extra space (in pixels) that is left above or
  //   below the cursor when it is scrolled into view. Defaults to 5.

  // DirectEditorProps:: interface extends EditorProps
  //
  // The props object given directly to the editor view supports two
  // fields that can't be used in plugins:
  //
  //   state:: EditorState
  //   The current state of the editor.
  //
  //   dispatchTransaction:: ?(tr: Transaction)
  //   The callback over which to send transactions (state updates)
  //   produced by the view. If you specify this, you probably want to
  //   make sure this ends up calling the view's
  //   [`updateState`](#view.EditorView.updateState) method with a new
  //   state that has the transaction
  //   [applied](#state.EditorState.apply). The callback will be bound to have
  //   the view instance as its `this` binding.

  exports.EditorView = EditorView;
  exports.Decoration = Decoration;
  exports.DecorationSet = DecorationSet;
  exports.__serializeForClipboard = serializeForClipboard;
  exports.__parseFromClipboard = parseFromClipboard;
  exports.__endComposition = endComposition;

  });

  unwrapExports(dist$4);
  var dist_1$3 = dist$4.EditorView;
  var dist_2$3 = dist$4.Decoration;
  var dist_3$3 = dist$4.DecorationSet;
  var dist_4$3 = dist$4.__serializeForClipboard;
  var dist_5$3 = dist$4.__parseFromClipboard;
  var dist_6$3 = dist$4.__endComposition;

  /**
   * @param {Object<string,any>} obj
   */
  const keys = Object.keys;

  /**
   * @module diff
   */

  /**
   * A SimpleDiff describes a change on a String.
   *
   * @example
   * console.log(a) // the old value
   * console.log(b) // the updated value
   * // Apply changes of diff (pseudocode)
   * a.remove(diff.index, diff.remove) // Remove `diff.remove` characters
   * a.insert(diff.index, diff.insert) // Insert `diff.insert`
   * a === b // values match
   *
   * @typedef {Object} SimpleDiff
   * @property {Number} index The index where changes were applied
   * @property {Number} remove The number of characters to delete starting
   *                                  at `index`.
   * @property {String} insert The new text to insert at `index` after applying
   *                           `delete`
   */

  /**
   * Create a diff between two strings. This diff implementation is highly
   * efficient, but not very sophisticated.
   *
   * @public
   * @param {String} a The old version of the string
   * @param {String} b The updated version of the string
   * @return {SimpleDiff} The diff description.
   */
  const simpleDiff = (a, b) => {
    let left = 0; // number of same characters counting from left
    let right = 0; // number of same characters counting from right
    while (left < a.length && left < b.length && a[left] === b[left]) {
      left++;
    }
    if (left !== a.length || left !== b.length) {
      // Only check right if a !== b
      while (right + left < a.length && right + left < b.length && a[a.length - right - 1] === b[b.length - right - 1]) {
        right++;
      }
    }
    return {
      index: left,
      remove: a.length - left - right,
      insert: b.slice(left, b.length - right)
    }
  };

  /**
   * Transforms a Prosemirror based absolute position to a Yjs Cursor (relative position in the Yjs model).
   *
   * @param {number} pos
   * @param {Y.XmlFragment} type
   * @param {ProsemirrorMapping} mapping
   * @return {any} relative position
   */
  const absolutePositionToRelativePosition = (pos, type, mapping) => {
    if (pos === 0) {
      return createRelativePositionFromTypeIndex(type, 0)
    }
    let n = type._first === null ? null : /** @type {Y.ContentType} */ (type._first.content).type;
    while (n !== null && type !== n) {
      const pNodeSize = (mapping.get(n) || { nodeSize: 0 }).nodeSize;
      if (n.constructor === YXmlText) {
        if (n._length >= pos) {
          return createRelativePositionFromTypeIndex(n, pos)
        } else {
          pos -= n._length;
        }
        if (n._item !== null && n._item.next !== null) {
          n = /** @type {Y.ContentType} */ (n._item.next.content).type;
        } else {
          do {
            n = n._item === null ? null : n._item.parent;
            pos--;
          } while (n !== type && n !== null && n._item !== null && n._item.next === null)
          if (n !== null && n !== type) {
            // @ts-gnore we know that n.next !== null because of above loop conditition
            n = n._item === null ? null : /** @type {Y.ContentType} */ (/** @type Y.Item */ (n._item.next).content).type;
          }
        }
      } else if (n._first !== null && pos < pNodeSize) {
        n = /** @type {Y.ContentType} */ (n._first.content).type;
        pos--;
      } else {
        if (pos === 1 && n._length === 0 && pNodeSize > 1) {
          // edge case, should end in this paragraph
          return new RelativePosition(n._item === null ? null : n._item.id, n._item === null ? findRootTypeKey(n) : null, null)
        }
        pos -= pNodeSize;
        if (n._item !== null && n._item.next !== null) {
          n = /** @type {Y.ContentType} */ (n._item.next.content).type;
        } else {
          if (pos === 0) {
            // set to end of n.parent
            n = n._item === null ? n : n._item.parent;
            return new RelativePosition(n._item === null ? null : n._item.id, n._item === null ? findRootTypeKey(n) : null, null)
          }
          do {
            n = /** @type {Y.Item} */ (n._item).parent;
            pos--;
          } while (n !== type && /** @type {Y.Item} */ (n._item).next === null)
          // if n is null at this point, we have an unexpected case
          if (n !== type) {
            // We know that n._item.next is defined because of above loop condition
            n = /** @type {Y.ContentType} */ (/** @type {Y.Item} */ (/** @type {Y.Item} */ (n._item).next).content).type;
          }
        }
      }
      if (n === null) {
        throw unexpectedCase()
      }
      if (pos === 0 && n.constructor !== YXmlText && n !== type) { // TODO: set to <= 0
        return new RelativePosition(n._item === null ? null : n._item.id, n._item === null ? findRootTypeKey(n) : null, null)
      }
    }
    return createRelativePositionFromTypeIndex(type, type._length)
  };

  /**
   * @param {Y.Doc} y
   * @param {Y.XmlFragment} yDoc Top level type that is bound to pView
   * @param {any} relPos Encoded Yjs based relative position
   * @param {ProsemirrorMapping} mapping
   */
  const relativePositionToAbsolutePosition = (y, yDoc, relPos, mapping) => {
    const decodedPos = createAbsolutePositionFromRelativePosition(relPos, y);
    if (decodedPos === null) {
      return null
    }
    let type = decodedPos.type;
    let pos = 0;
    if (type.constructor === YXmlText) {
      pos = decodedPos.index;
    } else if (type._item === null || !type._item.deleted) {
      let n = type._first;
      let i = 0;
      while (i < type._length && i < decodedPos.index && n !== null) {
        if (!n.deleted) {
          const t = /** @type {Y.ContentType} */ (n.content).type;
          i++;
          if (t.constructor === YXmlText) {
            pos += t._length;
          } else {
            pos += mapping.get(t).nodeSize;
          }
        }
        n = /** @type {Y.Item} */ (n.right);
      }
      pos += 1; // increase because we go out of n
    }
    while (type !== yDoc) {
      // @ts-ignore
      const parent = type._item.parent;
      // @ts-ignore
      if (parent._item === null || !parent._item.deleted) {
        pos += 1; // the start tag
        let n = parent._first;
        // now iterate until we found type
        while (n !== null) {
          const contentType = /** @type {Y.ContentType} */ (n.content).type;
          if (contentType === type) {
            break
          }
          if (!n.deleted) {
            if (contentType.constructor === YXmlText) {
              pos += contentType._length;
            } else {
              pos += mapping.get(contentType).nodeSize;
            }
          }
          n = n.right;
        }
      }
      type = parent;
    }
    return pos - 1 // we don't count the most outer tag, because it is a fragment
  };

  /**
   * @module bindings/prosemirror
   */

  const isVisible$1 = (item, snapshot) => snapshot === undefined ? !item._deleted : (snapshot.sm.has(item._id.user) && snapshot.sm.get(item._id.user) > item._id.clock && !snapshot.ds.isDeleted(item._id));

  /**
   * @typedef {Map<Y.AbstractType, Object>} ProsemirrorMapping
   */

  /**
   * The unique prosemirror plugin key for prosemirrorPlugin.
   *
   * @public
   */
  const ySyncPluginKey = new dist_9$2('y-sync');

  /**
   * This plugin listens to changes in prosemirror view and keeps yXmlState and view in sync.
   *
   * This plugin also keeps references to the type and the shared document so other plugins can access it.
   * @param {Y.XmlFragment} yXmlFragment
   * @return {Plugin} Returns a prosemirror plugin that binds to this type
   */
  const ySyncPlugin = (yXmlFragment) => {
    let changedInitialContent = false;
    const plugin = new dist_8$2({
      props: {
        editable: (state) => ySyncPluginKey.getState(state).snapshot == null
      },
      key: ySyncPluginKey,
      state: {
        init: (initargs, state) => {
          return {
            type: yXmlFragment,
            doc: yXmlFragment.doc,
            binding: null,
            snapshot: null,
            isChangeOrigin: false
          }
        },
        apply: (tr, pluginState) => {
          const change = tr.getMeta(ySyncPluginKey);
          if (change !== undefined) {
            pluginState = Object.assign({}, pluginState);
            for (let key in change) {
              pluginState[key] = change[key];
            }
          }
          // always set isChangeOrigin. If undefined, this is not change origin.
          pluginState.isChangeOrigin = change !== undefined && !!change.isChangeOrigin;
          if (pluginState.binding !== null) {
            if (change !== undefined && change.snapshot !== undefined) {
              // snapshot changed, rerender next
              setTimeout(() => {
                if (change.restore == null) {
                  pluginState.binding._renderSnapshot(change.snapshot, change.prevSnapshot);
                } else {
                  pluginState.binding._renderSnapshot(change.snapshot, change.snapshot);
                  // reset to current prosemirror state
                  delete pluginState.restore;
                  delete pluginState.snapshot;
                  delete pluginState.prevSnapshot;
                  pluginState.binding._prosemirrorChanged(pluginState.binding.prosemirrorView.state.doc);
                }
              }, 0);
            }
          }
          return pluginState
        }
      },
      view: view => {
        const binding = new ProsemirrorBinding(yXmlFragment, view);
        // Make sure this is called in a separate context
        setTimeout(() => {
          view.dispatch(view.state.tr.setMeta(ySyncPluginKey, { binding }));
        }, 0);
        return {
          update: () => {
            const pluginState = plugin.getState(view.state);
            if (pluginState.snapshot == null) {
              if (changedInitialContent || view.state.doc.content.size > 2) {
                changedInitialContent = true;
                binding._prosemirrorChanged(view.state.doc);
              }
            }
          },
          destroy: () => {
            binding.destroy();
          }
        }
      }
    });
    return plugin
  };

  /**
   * @param {any} tr
   * @param {any} relSel
   * @param {ProsemirrorBinding} binding
   */
  const restoreRelativeSelection = (tr, relSel, binding) => {
    if (relSel !== null && relSel.anchor !== null && relSel.head !== null) {
      const anchor = relativePositionToAbsolutePosition(binding.doc, binding.type, relSel.anchor, binding.mapping);
      const head = relativePositionToAbsolutePosition(binding.doc, binding.type, relSel.head, binding.mapping);
      if (anchor !== null && head !== null) {
        tr = tr.setSelection(dist_3$2.create(tr.doc, anchor, head));
      }
    }
  };

  const getRelativeSelection = (pmbinding, state) => ({
    anchor: absolutePositionToRelativePosition(state.selection.anchor, pmbinding.type, pmbinding.mapping),
    head: absolutePositionToRelativePosition(state.selection.head, pmbinding.type, pmbinding.mapping)
  });

  /**
   * Binding for prosemirror.
   *
   * @protected
   */
  class ProsemirrorBinding {
    /**
     * @param {Y.XmlFragment} yXmlFragment The bind source
     * @param {EditorView} prosemirrorView The target binding
     */
    constructor (yXmlFragment, prosemirrorView) {
      this.type = yXmlFragment;
      this.prosemirrorView = prosemirrorView;
      this.mux = createMutex();
      /**
       * @type {ProsemirrorMapping}
       */
      this.mapping = new Map();
      this._observeFunction = this._typeChanged.bind(this);
      /**
       * @type {Y.Doc}
       */
      // @ts-ignore
      this.doc = yXmlFragment.doc;
      /**
       * current selection as relative positions in the Yjs model
       */
      this.beforeTransactionSelection = null;
      this.doc.on('beforeTransaction', e => {
        this.beforeTransactionSelection = getRelativeSelection(this, prosemirrorView.state);
      });
      yXmlFragment.observeDeep(this._observeFunction);
    }
    _forceRerender () {
      this.mapping = new Map();
      this.mux(() => {
        const fragmentContent = this.type.toArray().map(t => createNodeFromYElement(/** @type {Y.XmlElement} */ (t), this.prosemirrorView.state.schema, this.mapping)).filter(n => n !== null);
        const tr = this.prosemirrorView.state.tr.replace(0, this.prosemirrorView.state.doc.content.size, new dist_5(new dist_4(fragmentContent), 0, 0));
        this.prosemirrorView.dispatch(tr);
      });
    }
    /**
     *
     * @param {Y.Snapshot} snapshot
     * @param {Y.Snapshot} prevSnapshot
     */
    _renderSnapshot (snapshot, prevSnapshot) {
      // clear mapping because we are going to rerender
      this.mapping = new Map();
      this.mux(() => {
        const fragmentContent = typeListToArraySnapshot(this.type, new Snapshot(prevSnapshot.ds, snapshot.sm)).map(t => createNodeFromYElement(t, this.prosemirrorView.state.schema, new Map(), snapshot, prevSnapshot)).filter(n => n !== null);
        const tr = this.prosemirrorView.state.tr.replace(0, this.prosemirrorView.state.doc.content.size, new dist_5(new dist_4(fragmentContent), 0, 0));
        this.prosemirrorView.dispatch(tr);
      });
    }
    /**
     * @param {Array<Y.YEvent>} events
     * @param {Y.Transaction} transaction
     */
    _typeChanged (events, transaction) {
      if (events.length === 0 || ySyncPluginKey.getState(this.prosemirrorView.state).snapshot != null) {
        // drop out if snapshot is active
        return
      }
      this.mux(() => {
        const delStruct = (_, struct) => this.mapping.delete(struct);
        iterateDeletedStructs(transaction, transaction.deleteSet, this.doc.store, struct => struct.constructor === Item && this.mapping.delete(/** @type {Y.ContentType} */ (/** @type {Y.Item} */ (struct).content).type));
        transaction.changed.forEach(delStruct);
        transaction.changedParentTypes.forEach(delStruct);
        const fragmentContent = this.type.toArray().map(t => createNodeIfNotExists(/** @type {Y.XmlElement | Y.XmlHook} */ (t), this.prosemirrorView.state.schema, this.mapping)).filter(n => n !== null);
        let tr = this.prosemirrorView.state.tr.replace(0, this.prosemirrorView.state.doc.content.size, new dist_5(new dist_4(fragmentContent), 0, 0));
        restoreRelativeSelection(tr, this.beforeTransactionSelection, this);
        tr = tr.setMeta(ySyncPluginKey, { isChangeOrigin: true });
        if (this.beforeTransactionSelection !== null && this.prosemirrorView.hasFocus()) {
          tr.scrollIntoView();
        }
        this.prosemirrorView.dispatch(tr);
      });
    }
    _prosemirrorChanged (doc) {
      this.mux(() => {
        updateYFragment(this.doc, this.type, doc.content, this.mapping);
      });
    }
    destroy () {
      this.type.unobserveDeep(this._observeFunction);
    }
  }

  /**
   * @private
   * @param {Y.XmlElement | Y.XmlHook} el
   * @param {PModel.Schema} schema
   * @param {ProsemirrorMapping} mapping
   * @param {Y.Snapshot} [snapshot]
   * @param {Y.Snapshot} [prevSnapshot]
   * @return {PModel.Node | null}
   */
  const createNodeIfNotExists = (el, schema, mapping, snapshot, prevSnapshot) => {
    const node = mapping.get(el);
    if (node === undefined) {
      if (el instanceof YXmlElement) {
        return createNodeFromYElement(el, schema, mapping, snapshot, prevSnapshot)
      } else {
        throw methodUnimplemented() // we are currently not handling hooks
      }
    }
    return node
  };

  /**
   * @private
   * @param {Y.XmlElement} el
   * @param {PModel.Schema} schema
   * @param {ProsemirrorMapping} mapping
   * @param {Y.Snapshot} [snapshot]
   * @param {Y.Snapshot} [prevSnapshot]
   * @return {PModel.Node | null} Returns node if node could be created. Otherwise it deletes the yjs type and returns null
   */
  const createNodeFromYElement = (el, schema, mapping, snapshot, prevSnapshot) => {
    let _snapshot = snapshot;
    let _prevSnapshot = prevSnapshot;
    if (snapshot !== undefined && prevSnapshot !== undefined) {
      if (!isVisible$1(el, snapshot)) {
        // if this element is already rendered as deleted (ychange), then do not render children as deleted
        _snapshot = new Snapshot(prevSnapshot.ds, snapshot.sm);
        _prevSnapshot = _snapshot;
      } else if (!isVisible$1(el, prevSnapshot)) {
        _prevSnapshot = _snapshot;
      }
    }
    const children = [];
    const createChildren = type => {
      if (type.constructor === YXmlElement) {
        const n = createNodeIfNotExists(type, schema, mapping, _snapshot, _prevSnapshot);
        if (n !== null) {
          children.push(n);
        }
      } else {
        const ns = createTextNodesFromYText(type, schema, mapping, _snapshot, _prevSnapshot);
        if (ns !== null) {
          ns.forEach(textchild => {
            if (textchild !== null) {
              children.push(textchild);
            }
          });
        }
      }
    };
    if (snapshot === undefined || prevSnapshot === undefined) {
      el.toArray().forEach(createChildren);
    } else {
      typeListToArraySnapshot(el, new Snapshot(prevSnapshot.ds, snapshot.sm)).forEach(createChildren);
    }
    let node;
    try {
      const attrs = el.getAttributes(_snapshot);
      if (snapshot !== undefined) {
        if (!isVisible$1(el, snapshot)) {
          attrs.ychange = { client: /** @type {Y.Item} */ (el._item).id.client, state: 'removed' };
        } else if (!isVisible$1(el, prevSnapshot)) {
          attrs.ychange = { client: /** @type {Y.Item} */ (el._item).id.client, state: 'added' };
        }
      }
      node = schema.node(el.nodeName, attrs, children);
    } catch (e) {
      // an error occured while creating the node. This is probably a result of a concurrent action.
      /** @type {Y.Doc} */ (el.doc).transact(transaction => {
        /** @type {Y.Item} */ (el._item).delete(transaction);
      });
      return null
    }
    mapping.set(el, node);
    return node
  };

  /**
   * @private
   * @param {Y.XmlText} text
   * @param {PModel.Schema} schema
   * @param {ProsemirrorMapping} mapping
   * @param {Y.Snapshot} [snapshot]
   * @param {Y.Snapshot} [prevSnapshot]
   * @return {Array<PModel.Node>|null}
   */
  const createTextNodesFromYText = (text, schema, mapping, snapshot, prevSnapshot) => {
    const nodes = [];
    const deltas = text.toDelta(snapshot, prevSnapshot);
    try {
      for (let i = 0; i < deltas.length; i++) {
        const delta = deltas[i];
        const marks = [];
        for (let markName in delta.attributes) {
          marks.push(schema.mark(markName, delta.attributes[markName]));
        }
        nodes.push(schema.text(delta.insert, marks));
      }
      if (nodes.length > 0) {
        mapping.set(text, nodes[0]); // only map to first child, all following children are also considered bound to this type
      }
    } catch (e) {
      // an error occured while creating the node. This is probably a result of a concurrent action.
      /** @type {Y.Doc} */ (text.doc).transact(transaction => {
        /** @type {Y.Item} */ (text._item).delete(transaction);
      });
      return null
    }
    // @ts-ignore
    return nodes
  };

  /**
   * @private
   * @param {Object} node prosemirror node
   * @param {ProsemirrorMapping} mapping
   * @return {Y.XmlElement | Y.XmlText}
   */
  const createTypeFromNode = (node, mapping) => {
    let type;
    if (node.isText) {
      type = new YXmlText();
      const attrs = {};
      node.marks.forEach(mark => {
        if (mark.type.name !== 'ychange') {
          attrs[mark.type.name] = mark.attrs;
        }
      });
      type.insert(0, node.text, attrs);
    } else {
      type = new YXmlElement(node.type.name);
      for (let key in node.attrs) {
        const val = node.attrs[key];
        if (val !== null && key !== 'ychange') {
          type.setAttribute(key, val);
        }
      }
      const ins = [];
      for (let i = 0; i < node.childCount; i++) {
        ins.push(createTypeFromNode(node.child(i), mapping));
      }
      type.insert(0, ins);
    }
    mapping.set(type, node);
    return type
  };

  const equalAttrs = (pattrs, yattrs) => {
    const keys = Object.keys(pattrs).filter(key => pattrs[key] !== null);
    let eq = keys.length === Object.keys(yattrs).filter(key => yattrs[key] !== null).length;
    for (let i = 0; i < keys.length && eq; i++) {
      const key = keys[i];
      const l = pattrs[key];
      const r = yattrs[key];
      eq = key === 'ychange' || l === r || (typeof l === 'object' && typeof r === 'object' && equalAttrs(l, r));
    }
    return eq
  };

  const equalYTextPText = (ytext, ptext) => {
    const delta = ytext.toDelta();
    if (delta.length === 0) {
      return ptext.text === ''
    }
    const d = delta[0];
    return d.insert === ptext.text && keys(d.attributes || {}).length === ptext.marks.length && ptext.marks.every(mark => equalAttrs(d.attributes[mark.type.name], mark.attrs))
  };

  const equalYTypePNode = (ytype, pnode) =>
    ytype.constructor === YXmlText
      ? equalYTextPText(ytype, pnode)
      : (matchNodeName(ytype, pnode) && ytype.length === pnode.childCount && equalAttrs(ytype.getAttributes(), pnode.attrs) && ytype.toArray().every((ychild, i) => equalYTypePNode(ychild, pnode.child(i))));

  const computeChildEqualityFactor = (ytype, pnode, mapping) => {
    const yChildren = ytype.toArray();
    const pChildCnt = pnode.childCount;
    const yChildCnt = yChildren.length;
    const minCnt = min(yChildCnt, pChildCnt);
    let left = 0;
    let right = 0;
    let foundMappedChild = false;
    for (; left < minCnt; left++) {
      const leftY = yChildren[left];
      const leftP = pnode.child(left);
      if (mapping.get(leftY) === leftP) {
        foundMappedChild = true;// definite (good) match!
      } else if (!equalYTypePNode(leftY, leftP)) {
        break
      }
    }
    for (; left + right < minCnt; right++) {
      const rightY = yChildren[yChildCnt - right - 1];
      const rightP = pnode.child(pChildCnt - right - 1);
      if (mapping.get(rightY) !== rightP) {
        foundMappedChild = true;
      } else if (!equalYTypePNode(rightP, rightP)) {
        break
      }
    }
    return {
      equalityFactor: left + right,
      foundMappedChild
    }
  };

  /**
   * @private
   * @param {Y.Doc} y
   * @param {Y.XmlFragment} yDomFragment
   * @param {Object} pContent
   * @param {ProsemirrorMapping} mapping
   */
  const updateYFragment = (y, yDomFragment, pContent, mapping) => {
    if (yDomFragment instanceof YXmlElement && yDomFragment.nodeName !== pContent.type.name) {
      throw new Error('node name mismatch!')
    }
    mapping.set(yDomFragment, pContent);
    // update attributes
    if (yDomFragment instanceof YXmlElement) {
      const yDomAttrs = yDomFragment.getAttributes();
      const pAttrs = pContent.attrs;
      for (let key in pAttrs) {
        if (pAttrs[key] !== null) {
          if (yDomAttrs[key] !== pAttrs[key] && key !== 'ychange') {
            yDomFragment.setAttribute(key, pAttrs[key]);
          }
        } else {
          yDomFragment.removeAttribute(key);
        }
      }
      // remove all keys that are no longer in pAttrs
      for (let key in yDomAttrs) {
        if (pAttrs[key] === undefined) {
          yDomFragment.removeAttribute(key);
        }
      }
    }
    // update children
    const pChildCnt = pContent.childCount;
    const yChildren = yDomFragment.toArray();
    const yChildCnt = yChildren.length;
    const minCnt = min(pChildCnt, yChildCnt);
    let left = 0;
    let right = 0;
    // find number of matching elements from left
    for (;left < minCnt; left++) {
      const leftY = yChildren[left];
      const leftP = pContent.child(left);
      if (mapping.get(leftY) !== leftP) {
        if (equalYTypePNode(leftY, leftP)) {
          // update mapping
          mapping.set(leftY, leftP);
        } else {
          break
        }
      }
    }
    // find number of matching elements from right
    for (;right + left < minCnt; right++) {
      const rightY = yChildren[yChildCnt - right - 1];
      const rightP = pContent.child(pChildCnt - right - 1);
      if (mapping.get(rightY) !== rightP) {
        if (equalYTypePNode(rightY, rightP)) {
          // update mapping
          mapping.set(rightY, rightP);
        } else {
          break
        }
      }
    }
    y.transact(() => {
      // try to compare and update
      while (yChildCnt - left - right > 0 && pChildCnt - left - right > 0) {
        const leftY = yChildren[left];
        const leftP = pContent.child(left);
        const rightY = yChildren[yChildCnt - right - 1];
        const rightP = pContent.child(pChildCnt - right - 1);
        if (leftY instanceof YXmlText && leftP.isText) {
          if (!equalYTextPText(leftY, leftP)) {
            // try to apply diff. Only if attrs don't match, delete insert
            // TODO: use a single ytext to hold all following Prosemirror Text nodes
            const pattrs = {};
            leftP.marks.forEach(mark => {
              if (mark.type.name !== 'ychange') {
                pattrs[mark.type.name] = mark.attrs;
              }
            });
            const delta = leftY.toDelta();
            if (delta.length === 1 && delta[0].insert && equalAttrs(pattrs, delta[0].attributes || {})) {
              const diff = simpleDiff(delta[0].insert, leftP.text);
              leftY.delete(diff.index, diff.remove);
              leftY.insert(diff.index, diff.insert, delta[0].attributes || {});
            } else {
              yDomFragment.delete(left, 1);
              yDomFragment.insert(left, [createTypeFromNode(leftP, mapping)]);
            }
          }
          left += 1;
        } else {
          let updateLeft = leftY instanceof YXmlElement && matchNodeName(leftY, leftP);
          let updateRight = rightY instanceof YXmlElement && matchNodeName(rightY, rightP);
          if (updateLeft && updateRight) {
            // decide which which element to update
            const equalityLeft = computeChildEqualityFactor(leftY, leftP, mapping);
            const equalityRight = computeChildEqualityFactor(rightY, rightP, mapping);
            if (equalityLeft.foundMappedChild && !equalityRight.foundMappedChild) {
              updateRight = false;
            } else if (!equalityLeft.foundMappedChild && equalityRight.foundMappedChild) {
              updateLeft = false;
            } else if (equalityLeft.equalityFactor < equalityRight.equalityFactor) {
              updateLeft = false;
            } else {
              updateRight = false;
            }
          }
          if (updateLeft) {
            updateYFragment(y, /** @type {Y.XmlFragment} */ (leftY), leftP, mapping);
            left += 1;
          } else if (updateRight) {
            updateYFragment(y, /** @type {Y.XmlFragment} */ (rightY), rightP, mapping);
            right += 1;
          } else {
            yDomFragment.delete(left, 1);
            yDomFragment.insert(left, [createTypeFromNode(leftP, mapping)]);
            left += 1;
          }
        }
      }
      const yDelLen = yChildCnt - left - right;
      if (yDelLen > 0) {
        yDomFragment.delete(left, yDelLen);
      }
      if (left + right < pChildCnt) {
        const ins = [];
        for (let i = left; i < pChildCnt - right; i++) {
          ins.push(createTypeFromNode(pContent.child(i), mapping));
        }
        yDomFragment.insert(left, ins);
      }
    });
  };

  /**
   * @function
   * @param {Y.XmlElement} yElement
   * @param {any} pNode Prosemirror Node
   */
  const matchNodeName = (yElement, pNode) => yElement.nodeName === pNode.type.name;

  /**
   * The unique prosemirror plugin key for cursorPlugin.type
   *
   * @public
   */
  const yCursorPluginKey = new dist_9$2('yjs-cursor');

  /**
   * A prosemirror plugin that listens to awareness information on Yjs.
   * This requires that a `prosemirrorPlugin` is also bound to the prosemirror.
   *
   * @public
   * @param {Awareness} awareness
   * @return {Plugin}
   */
  const yCursorPlugin = awareness => new dist_8$2({
    key: yCursorPluginKey,
    props: {
      decorations: state => {
        const ystate = ySyncPluginKey.getState(state);
        const y = ystate.doc;
        const decorations = [];
        if (ystate.snapshot != null || ystate.binding === null) {
          // do not render cursors while snapshot is active
          return
        }
        awareness.getStates().forEach((aw, clientId) => {
          if (clientId === y.clientID) {
            return
          }
          if (aw.cursor != null) {
            let user = aw.user || {};
            if (user.color == null) {
              user.color = '#ffa500';
            }
            if (user.name == null) {
              user.name = `User: ${clientId}`;
            }
            let anchor = relativePositionToAbsolutePosition(y, ystate.type, createRelativePositionFromJSON(aw.cursor.anchor), ystate.binding.mapping);
            let head = relativePositionToAbsolutePosition(y, ystate.type, createRelativePositionFromJSON(aw.cursor.head), ystate.binding.mapping);
            if (anchor !== null && head !== null) {
              let maxsize = max(state.doc.content.size - 1, 0);
              anchor = min(anchor, maxsize);
              head = min(head, maxsize);
              decorations.push(dist_2$3.widget(head, () => {
                const cursor = document.createElement('span');
                cursor.classList.add('ProseMirror-yjs-cursor');
                cursor.setAttribute('style', `border-color: ${user.color}`);
                const userDiv = document.createElement('div');
                userDiv.setAttribute('style', `background-color: ${user.color}`);
                userDiv.insertBefore(document.createTextNode(user.name), null);
                cursor.insertBefore(userDiv, null);
                return cursor
              }, { key: clientId + '' }));
              const from = min(anchor, head);
              const to = max(anchor, head);
              decorations.push(dist_2$3.inline(from, to, { style: `background-color: ${user.color}70` }));
            }
          }
        });
        return dist_3$3.create(state.doc, decorations)
      }
    },
    view: view => {
      const awarenessListener = () => {
        view.updateState(view.state);
      };
      const updateCursorInfo = () => {
        const ystate = ySyncPluginKey.getState(view.state);
        const current = awareness.getLocalState() || {};
        if (view.hasFocus() && ystate.binding !== null) {
          /**
           * @type {Y.RelativePosition}
           */
          const anchor = absolutePositionToRelativePosition(view.state.selection.anchor, ystate.type, ystate.binding.mapping);
          /**
           * @type {Y.RelativePosition}
           */
          const head = absolutePositionToRelativePosition(view.state.selection.head, ystate.type, ystate.binding.mapping);
          if (current.cursor == null || !compareRelativePositions(createRelativePositionFromJSON(current.cursor.anchor), anchor) || !compareRelativePositions(createRelativePositionFromJSON(current.cursor.head), head)) {
            awareness.setLocalStateField('cursor', {
              anchor, head
            });
          }
        } else if (current.cursor !== null) {
          awareness.setLocalStateField('cursor', null);
        }
      };
      awareness.on('change', awarenessListener);
      view.dom.addEventListener('focusin', updateCursorInfo);
      view.dom.addEventListener('focusout', updateCursorInfo);
      return {
        update: updateCursorInfo,
        destroy: () => {
          awareness.setLocalStateField('cursor', null);
          awareness.off('change', awarenessListener);
        }
      }
    }
  });

  const undo = state => {
    const undoManager = yUndoPluginKey.getState(state).undoManager;
    if (undoManager != null) {
      undoManager.undo();
      return true
    }
  };

  const redo = state => {
    const undoManager = yUndoPluginKey.getState(state).undoManager;
    if (undoManager != null) {
      undoManager.redo();
      return true
    }
  };

  const yUndoPluginKey = new dist_9$2('y-undo');

  const yUndoPlugin = new dist_8$2({
    key: yUndoPluginKey,
    state: {
      init: (initargs, state) => {
        // TODO: check if plugin order matches and fix
        const ystate = ySyncPluginKey.getState(state);
        const undoManager = new UndoManager(ystate.type, new Set([null, ySyncPluginKey]));
        return {
          undoManager,
          prevSel: null
        }
      },
      apply: (tr, val, oldState, state) => {
        const binding = ySyncPluginKey.getState(state).binding;
        if (binding) {
          return {
            undoManager: val.undoManager,
            prevSel: getRelativeSelection(binding, oldState)
          }
        } else {
          return val
        }
      }
    },
    view: view => {
      const ystate = ySyncPluginKey.getState(view.state);
      const undoManager = yUndoPluginKey.getState(view.state).undoManager;
      undoManager.on('stack-item-added', ({ stackItem }) => {
        const binding = ystate.binding;
        if (binding) {
          stackItem.meta.set(binding, yUndoPluginKey.getState(view.state).prevSel);
        }
      });
      undoManager.on('stack-item-popped', ({ stackItem }) => {
        const binding = ystate.binding;
        if (binding) {
          binding.beforeTransactionSelection = stackItem.meta.get(binding) || binding.beforeTransactionSelection;
        }
      });
      return {
        destroy: () => {
          undoManager.destroy();
        }
      }
    }
  });

  const brDOM = ['br'];

  const calcYchangeDomAttrs = (attrs, domAttrs = {}) => {
    domAttrs = Object.assign({}, domAttrs);
    if (attrs.ychange !== null) {
      domAttrs.ychange_user = attrs.ychange.user;
      domAttrs.ychange_state = attrs.ychange.state;
    }
    return domAttrs
  };

  // :: Object
  // [Specs](#model.NodeSpec) for the nodes defined in this schema.
  const nodes = {
    // :: NodeSpec The top level document node.
    doc: {
      content: 'block+'
    },

    // :: NodeSpec A plain paragraph textblock. Represented in the DOM
    // as a `<p>` element.
    paragraph: {
      attrs: { ychange: { default: null } },
      content: 'inline*',
      group: 'block',
      parseDOM: [{ tag: 'p' }],
      toDOM (node) { return ['p', calcYchangeDomAttrs(node.attrs), 0] }
    },

    // :: NodeSpec A blockquote (`<blockquote>`) wrapping one or more blocks.
    blockquote: {
      attrs: { ychange: { default: null } },
      content: 'block+',
      group: 'block',
      defining: true,
      parseDOM: [{ tag: 'blockquote' }],
      toDOM (node) { return ['blockquote', calcYchangeDomAttrs(node.attrs), 0] }
    },

    // :: NodeSpec A horizontal rule (`<hr>`).
    horizontal_rule: {
      attrs: { ychange: { default: null } },
      group: 'block',
      parseDOM: [{ tag: 'hr' }],
      toDOM (node) {
        return ['hr', calcYchangeDomAttrs(node.attrs)]
      }
    },

    // :: NodeSpec A heading textblock, with a `level` attribute that
    // should hold the number 1 to 6. Parsed and serialized as `<h1>` to
    // `<h6>` elements.
    heading: {
      attrs: {
        level: { default: 1 },
        ychange: { default: null }
      },
      content: 'inline*',
      group: 'block',
      defining: true,
      parseDOM: [{ tag: 'h1', attrs: { level: 1 } },
        { tag: 'h2', attrs: { level: 2 } },
        { tag: 'h3', attrs: { level: 3 } },
        { tag: 'h4', attrs: { level: 4 } },
        { tag: 'h5', attrs: { level: 5 } },
        { tag: 'h6', attrs: { level: 6 } }],
      toDOM (node) { return ['h' + node.attrs.level, calcYchangeDomAttrs(node.attrs), 0] }
    },

    // :: NodeSpec A code listing. Disallows marks or non-text inline
    // nodes by default. Represented as a `<pre>` element with a
    // `<code>` element inside of it.
    code_block: {
      attrs: { ychange: { default: null } },
      content: 'text*',
      marks: '',
      group: 'block',
      code: true,
      defining: true,
      parseDOM: [{ tag: 'pre', preserveWhitespace: 'full' }],
      toDOM (node) { return ['pre', calcYchangeDomAttrs(node.attrs), ['code', 0]] }
    },

    // :: NodeSpec The text node.
    text: {
      group: 'inline'
    },

    // :: NodeSpec An inline image (`<img>`) node. Supports `src`,
    // `alt`, and `href` attributes. The latter two default to the empty
    // string.
    image: {
      inline: true,
      attrs: {
        ychange: { default: null },
        src: {},
        alt: { default: null },
        title: { default: null }
      },
      group: 'inline',
      draggable: true,
      parseDOM: [{ tag: 'img[src]',
        getAttrs (dom) {
          return {
            src: dom.getAttribute('src'),
            title: dom.getAttribute('title'),
            alt: dom.getAttribute('alt')
          }
        } }],
      toDOM (node) {
        const domAttrs = {
          src: node.attrs.src,
          title: node.attrs.title,
          alt: node.attrs.alt
        };
        return ['img', calcYchangeDomAttrs(node.attrs, domAttrs)]
      }
    },

    // :: NodeSpec A hard line break, represented in the DOM as `<br>`.
    hard_break: {
      inline: true,
      group: 'inline',
      selectable: false,
      parseDOM: [{ tag: 'br' }],
      toDOM () { return brDOM }
    }
  };

  const emDOM = ['em', 0]; const strongDOM = ['strong', 0]; const codeDOM = ['code', 0];

  // :: Object [Specs](#model.MarkSpec) for the marks in the schema.
  const marks = {
    // :: MarkSpec A link. Has `href` and `title` attributes. `title`
    // defaults to the empty string. Rendered and parsed as an `<a>`
    // element.
    link: {
      attrs: {
        href: {},
        title: { default: null }
      },
      inclusive: false,
      parseDOM: [{ tag: 'a[href]',
        getAttrs (dom) {
          return { href: dom.getAttribute('href'), title: dom.getAttribute('title') }
        } }],
      toDOM (node) { return ['a', node.attrs, 0] }
    },

    // :: MarkSpec An emphasis mark. Rendered as an `<em>` element.
    // Has parse rules that also match `<i>` and `font-style: italic`.
    em: {
      parseDOM: [{ tag: 'i' }, { tag: 'em' }, { style: 'font-style=italic' }],
      toDOM () { return emDOM }
    },

    // :: MarkSpec A strong mark. Rendered as `<strong>`, parse rules
    // also match `<b>` and `font-weight: bold`.
    strong: {
      parseDOM: [{ tag: 'strong' },
        // This works around a Google Docs misbehavior where
        // pasted content will be inexplicably wrapped in `<b>`
        // tags with a font-weight normal.
        { tag: 'b', getAttrs: node => node.style.fontWeight !== 'normal' && null },
        { style: 'font-weight', getAttrs: value => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null }],
      toDOM () { return strongDOM }
    },

    // :: MarkSpec Code font mark. Represented as a `<code>` element.
    code: {
      parseDOM: [{ tag: 'code' }],
      toDOM () { return codeDOM }
    },
    ychange: {
      attrs: {
        user: { default: null },
        state: { default: null }
      },
      inclusive: false,
      parseDOM: [{ tag: 'ychange' }],
      toDOM (node) {
        return ['ychange', { ychange_user: node.attrs.user, ychange_state: node.attrs.state }, 0]
      }
    }
  };

  // :: Schema
  // This schema rougly corresponds to the document schema used by
  // [CommonMark](http://commonmark.org/), minus the list elements,
  // which are defined in the [`prosemirror-schema-list`](#schema-list)
  // module.
  //
  // To reuse elements from this schema, extend or read from its
  // `spec.nodes` and `spec.marks` [properties](#model.Schema.spec).
  const schema = new dist_8({ nodes, marks });

  var base = {
    8: "Backspace",
    9: "Tab",
    10: "Enter",
    12: "NumLock",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    44: "PrintScreen",
    45: "Insert",
    46: "Delete",
    59: ";",
    61: "=",
    91: "Meta",
    92: "Meta",
    106: "*",
    107: "+",
    108: ",",
    109: "-",
    110: ".",
    111: "/",
    144: "NumLock",
    145: "ScrollLock",
    160: "Shift",
    161: "Shift",
    162: "Control",
    163: "Control",
    164: "Alt",
    165: "Alt",
    173: "-",
    186: ";",
    187: "=",
    188: ",",
    189: "-",
    190: ".",
    191: "/",
    192: "`",
    219: "[",
    220: "\\",
    221: "]",
    222: "'",
    229: "q"
  };
  var shift = {
    48: ")",
    49: "!",
    50: "@",
    51: "#",
    52: "$",
    53: "%",
    54: "^",
    55: "&",
    56: "*",
    57: "(",
    59: ";",
    61: "+",
    173: "_",
    186: ":",
    187: "+",
    188: "<",
    189: "_",
    190: ">",
    191: "?",
    192: "~",
    219: "{",
    220: "|",
    221: "}",
    222: "\"",
    229: "Q"
  };

  var chrome = typeof navigator != "undefined" && /Chrome\/(\d+)/.exec(navigator.userAgent);
  var safari = typeof navigator != "undefined" && /Apple Computer/.test(navigator.vendor);
  var gecko = typeof navigator != "undefined" && /Gecko\/\d+/.test(navigator.userAgent);
  var mac = typeof navigator != "undefined" && /Mac/.test(navigator.platform);
  var brokenModifierNames = chrome && (mac || +chrome[1] < 57) || gecko && mac;

  // Fill in the digit keys
  for (var i = 0; i < 10; i++) base[48 + i] = base[96 + i] = String(i);

  // The function keys
  for (var i = 1; i <= 24; i++) base[i + 111] = "F" + i;

  // And the alphabetic keys
  for (var i = 65; i <= 90; i++) {
    base[i] = String.fromCharCode(i + 32);
    shift[i] = String.fromCharCode(i);
  }

  // For each code that doesn't have a shift-equivalent, copy the base name
  for (var code in base) if (!shift.hasOwnProperty(code)) shift[code] = base[code];

  function keyName(event) {
    // Don't trust event.key in Chrome when there are modifiers until
    // they fix https://bugs.chromium.org/p/chromium/issues/detail?id=633838
    var ignoreKey = brokenModifierNames && (event.ctrlKey || event.altKey || event.metaKey) ||
      safari && event.shiftKey && event.key && event.key.length == 1;
    var name = (!ignoreKey && event.key) ||
      (event.shiftKey ? shift : base)[event.keyCode] ||
      event.key || "Unidentified";
    // Edge sometimes produces wrong names (Issue #3)
    if (name == "Esc") name = "Escape";
    if (name == "Del") name = "Delete";
    // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/8860571/
    if (name == "Left") name = "ArrowLeft";
    if (name == "Up") name = "ArrowUp";
    if (name == "Right") name = "ArrowRight";
    if (name == "Down") name = "ArrowDown";
    return name
  }

  var w3cKeyname = keyName;
  keyName.base = base;
  keyName.shift = shift;

  var w3cKeyname$1 = /*#__PURE__*/Object.freeze({
    'default': w3cKeyname,
    __moduleExports: w3cKeyname
  });

  var require$$0$1 = ( w3cKeyname$1 && w3cKeyname ) || w3cKeyname$1;

  var keymap_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, '__esModule', { value: true });

  function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

  var keyName = _interopDefault(require$$0$1);


  // declare global: navigator

  var mac = typeof navigator != "undefined" ? /Mac/.test(navigator.platform) : false;

  function normalizeKeyName(name) {
    var parts = name.split(/-(?!$)/), result = parts[parts.length - 1];
    if (result == "Space") { result = " "; }
    var alt, ctrl, shift, meta;
    for (var i = 0; i < parts.length - 1; i++) {
      var mod = parts[i];
      if (/^(cmd|meta|m)$/i.test(mod)) { meta = true; }
      else if (/^a(lt)?$/i.test(mod)) { alt = true; }
      else if (/^(c|ctrl|control)$/i.test(mod)) { ctrl = true; }
      else if (/^s(hift)?$/i.test(mod)) { shift = true; }
      else if (/^mod$/i.test(mod)) { if (mac) { meta = true; } else { ctrl = true; } }
      else { throw new Error("Unrecognized modifier name: " + mod) }
    }
    if (alt) { result = "Alt-" + result; }
    if (ctrl) { result = "Ctrl-" + result; }
    if (meta) { result = "Meta-" + result; }
    if (shift) { result = "Shift-" + result; }
    return result
  }

  function normalize(map) {
    var copy = Object.create(null);
    for (var prop in map) { copy[normalizeKeyName(prop)] = map[prop]; }
    return copy
  }

  function modifiers(name, event, shift) {
    if (event.altKey) { name = "Alt-" + name; }
    if (event.ctrlKey) { name = "Ctrl-" + name; }
    if (event.metaKey) { name = "Meta-" + name; }
    if (shift !== false && event.shiftKey) { name = "Shift-" + name; }
    return name
  }

  // :: (Object) → Plugin
  // Create a keymap plugin for the given set of bindings.
  //
  // Bindings should map key names to [command](#commands)-style
  // functions, which will be called with `(EditorState, dispatch,
  // EditorView)` arguments, and should return true when they've handled
  // the key. Note that the view argument isn't part of the command
  // protocol, but can be used as an escape hatch if a binding needs to
  // directly interact with the UI.
  //
  // Key names may be strings like `"Shift-Ctrl-Enter"`—a key
  // identifier prefixed with zero or more modifiers. Key identifiers
  // are based on the strings that can appear in
  // [`KeyEvent.key`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key).
  // Use lowercase letters to refer to letter keys (or uppercase letters
  // if you want shift to be held). You may use `"Space"` as an alias
  // for the `" "` name.
  //
  // Modifiers can be given in any order. `Shift-` (or `s-`), `Alt-` (or
  // `a-`), `Ctrl-` (or `c-` or `Control-`) and `Cmd-` (or `m-` or
  // `Meta-`) are recognized. For characters that are created by holding
  // shift, the `Shift-` prefix is implied, and should not be added
  // explicitly.
  //
  // You can use `Mod-` as a shorthand for `Cmd-` on Mac and `Ctrl-` on
  // other platforms.
  //
  // You can add multiple keymap plugins to an editor. The order in
  // which they appear determines their precedence (the ones early in
  // the array get to dispatch first).
  function keymap(bindings) {
    return new dist$3.Plugin({props: {handleKeyDown: keydownHandler(bindings)}})
  }

  // :: (Object) → (view: EditorView, event: dom.Event) → bool
  // Given a set of bindings (using the same format as
  // [`keymap`](#keymap.keymap), return a [keydown
  // handler](#view.EditorProps.handleKeyDown) handles them.
  function keydownHandler(bindings) {
    var map = normalize(bindings);
    return function(view, event) {
      var name = keyName(event), isChar = name.length == 1 && name != " ", baseName;
      var direct = map[modifiers(name, event, !isChar)];
      if (direct && direct(view.state, view.dispatch, view)) { return true }
      if (isChar && (event.shiftKey || event.altKey || event.metaKey) &&
          (baseName = keyName.base[event.keyCode]) && baseName != name) {
        var fromCode = map[modifiers(baseName, event, true)];
        if (fromCode && fromCode(view.state, view.dispatch, view)) { return true }
      }
      return false
    }
  }

  exports.keymap = keymap;
  exports.keydownHandler = keydownHandler;

  });

  unwrapExports(keymap_1);
  var keymap_2 = keymap_1.keymap;
  var keymap_3 = keymap_1.keydownHandler;

  var GOOD_LEAF_SIZE = 200;

  // :: class<T> A rope sequence is a persistent sequence data structure
  // that supports appending, prepending, and slicing without doing a
  // full copy. It is represented as a mostly-balanced tree.
  var RopeSequence = function RopeSequence () {};

  RopeSequence.prototype.append = function append (other) {
    if (!other.length) { return this }
    other = RopeSequence.from(other);

    return (!this.length && other) ||
      (other.length < GOOD_LEAF_SIZE && this.leafAppend(other)) ||
      (this.length < GOOD_LEAF_SIZE && other.leafPrepend(this)) ||
      this.appendInner(other)
  };

  // :: (union<[T], RopeSequence<T>>) → RopeSequence<T>
  // Prepend an array or other rope to this one, returning a new rope.
  RopeSequence.prototype.prepend = function prepend (other) {
    if (!other.length) { return this }
    return RopeSequence.from(other).append(this)
  };

  RopeSequence.prototype.appendInner = function appendInner (other) {
    return new Append(this, other)
  };

  // :: (?number, ?number) → RopeSequence<T>
  // Create a rope repesenting a sub-sequence of this rope.
  RopeSequence.prototype.slice = function slice (from, to) {
      if ( from === void 0 ) from = 0;
      if ( to === void 0 ) to = this.length;

    if (from >= to) { return RopeSequence.empty }
    return this.sliceInner(Math.max(0, from), Math.min(this.length, to))
  };

  // :: (number) → T
  // Retrieve the element at the given position from this rope.
  RopeSequence.prototype.get = function get (i) {
    if (i < 0 || i >= this.length) { return undefined }
    return this.getInner(i)
  };

  // :: ((element: T, index: number) → ?bool, ?number, ?number)
  // Call the given function for each element between the given
  // indices. This tends to be more efficient than looping over the
  // indices and calling `get`, because it doesn't have to descend the
  // tree for every element.
  RopeSequence.prototype.forEach = function forEach (f, from, to) {
      if ( from === void 0 ) from = 0;
      if ( to === void 0 ) to = this.length;

    if (from <= to)
      { this.forEachInner(f, from, to, 0); }
    else
      { this.forEachInvertedInner(f, from, to, 0); }
  };

  // :: ((element: T, index: number) → U, ?number, ?number) → [U]
  // Map the given functions over the elements of the rope, producing
  // a flat array.
  RopeSequence.prototype.map = function map (f, from, to) {
      if ( from === void 0 ) from = 0;
      if ( to === void 0 ) to = this.length;

    var result = [];
    this.forEach(function (elt, i) { return result.push(f(elt, i)); }, from, to);
    return result
  };

  // :: (?union<[T], RopeSequence<T>>) → RopeSequence<T>
  // Create a rope representing the given array, or return the rope
  // itself if a rope was given.
  RopeSequence.from = function from (values) {
    if (values instanceof RopeSequence) { return values }
    return values && values.length ? new Leaf(values) : RopeSequence.empty
  };

  var Leaf = (function (RopeSequence) {
    function Leaf(values) {
      RopeSequence.call(this);
      this.values = values;
    }

    if ( RopeSequence ) Leaf.__proto__ = RopeSequence;
    Leaf.prototype = Object.create( RopeSequence && RopeSequence.prototype );
    Leaf.prototype.constructor = Leaf;

    var prototypeAccessors = { length: {},depth: {} };

    Leaf.prototype.flatten = function flatten () {
      return this.values
    };

    Leaf.prototype.sliceInner = function sliceInner (from, to) {
      if (from == 0 && to == this.length) { return this }
      return new Leaf(this.values.slice(from, to))
    };

    Leaf.prototype.getInner = function getInner (i) {
      return this.values[i]
    };

    Leaf.prototype.forEachInner = function forEachInner (f, from, to, start) {
      var this$1 = this;

      for (var i = from; i < to; i++)
        { if (f(this$1.values[i], start + i) === false) { return false } }
    };

    Leaf.prototype.forEachInvertedInner = function forEachInvertedInner (f, from, to, start) {
      var this$1 = this;

      for (var i = from - 1; i >= to; i--)
        { if (f(this$1.values[i], start + i) === false) { return false } }
    };

    Leaf.prototype.leafAppend = function leafAppend (other) {
      if (this.length + other.length <= GOOD_LEAF_SIZE)
        { return new Leaf(this.values.concat(other.flatten())) }
    };

    Leaf.prototype.leafPrepend = function leafPrepend (other) {
      if (this.length + other.length <= GOOD_LEAF_SIZE)
        { return new Leaf(other.flatten().concat(this.values)) }
    };

    prototypeAccessors.length.get = function () { return this.values.length };

    prototypeAccessors.depth.get = function () { return 0 };

    Object.defineProperties( Leaf.prototype, prototypeAccessors );

    return Leaf;
  }(RopeSequence));

  // :: RopeSequence
  // The empty rope sequence.
  RopeSequence.empty = new Leaf([]);

  var Append = (function (RopeSequence) {
    function Append(left, right) {
      RopeSequence.call(this);
      this.left = left;
      this.right = right;
      this.length = left.length + right.length;
      this.depth = Math.max(left.depth, right.depth) + 1;
    }

    if ( RopeSequence ) Append.__proto__ = RopeSequence;
    Append.prototype = Object.create( RopeSequence && RopeSequence.prototype );
    Append.prototype.constructor = Append;

    Append.prototype.flatten = function flatten () {
      return this.left.flatten().concat(this.right.flatten())
    };

    Append.prototype.getInner = function getInner (i) {
      return i < this.left.length ? this.left.get(i) : this.right.get(i - this.left.length)
    };

    Append.prototype.forEachInner = function forEachInner (f, from, to, start) {
      var leftLen = this.left.length;
      if (from < leftLen &&
          this.left.forEachInner(f, from, Math.min(to, leftLen), start) === false)
        { return false }
      if (to > leftLen &&
          this.right.forEachInner(f, Math.max(from - leftLen, 0), Math.min(this.length, to) - leftLen, start + leftLen) === false)
        { return false }
    };

    Append.prototype.forEachInvertedInner = function forEachInvertedInner (f, from, to, start) {
      var leftLen = this.left.length;
      if (from > leftLen &&
          this.right.forEachInvertedInner(f, from - leftLen, Math.max(to, leftLen) - leftLen, start + leftLen) === false)
        { return false }
      if (to < leftLen &&
          this.left.forEachInvertedInner(f, Math.min(from, leftLen), to, start) === false)
        { return false }
    };

    Append.prototype.sliceInner = function sliceInner (from, to) {
      if (from == 0 && to == this.length) { return this }
      var leftLen = this.left.length;
      if (to <= leftLen) { return this.left.slice(from, to) }
      if (from >= leftLen) { return this.right.slice(from - leftLen, to - leftLen) }
      return this.left.slice(from, leftLen).append(this.right.slice(0, to - leftLen))
    };

    Append.prototype.leafAppend = function leafAppend (other) {
      var inner = this.right.leafAppend(other);
      if (inner) { return new Append(this.left, inner) }
    };

    Append.prototype.leafPrepend = function leafPrepend (other) {
      var inner = this.left.leafPrepend(other);
      if (inner) { return new Append(inner, this.right) }
    };

    Append.prototype.appendInner = function appendInner (other) {
      if (this.left.depth >= Math.max(this.right.depth, other.depth) + 1)
        { return new Append(this.left, new Append(this.right, other)) }
      return new Append(this, other)
    };

    return Append;
  }(RopeSequence));

  var dist$5 = RopeSequence;

  var dist$6 = /*#__PURE__*/Object.freeze({
    'default': dist$5,
    __moduleExports: dist$5
  });

  var require$$0$2 = ( dist$6 && dist$5 ) || dist$6;

  var history_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, '__esModule', { value: true });

  function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

  var RopeSequence = _interopDefault(require$$0$2);



  // ProseMirror's history isn't simply a way to roll back to a previous
  // state, because ProseMirror supports applying changes without adding
  // them to the history (for example during collaboration).
  //
  // To this end, each 'Branch' (one for the undo history and one for
  // the redo history) keeps an array of 'Items', which can optionally
  // hold a step (an actual undoable change), and always hold a position
  // map (which is needed to move changes below them to apply to the
  // current document).
  //
  // An item that has both a step and a selection bookmark is the start
  // of an 'event' — a group of changes that will be undone or redone at
  // once. (It stores only the bookmark, since that way we don't have to
  // provide a document until the selection is actually applied, which
  // is useful when compressing.)

  // Used to schedule history compression
  var max_empty_items = 500;

  var Branch = function Branch(items, eventCount) {
    this.items = items;
    this.eventCount = eventCount;
  };

  // : (EditorState, bool) → ?{transform: Transform, selection: ?SelectionBookmark, remaining: Branch}
  // Pop the latest event off the branch's history and apply it
  // to a document transform.
  Branch.prototype.popEvent = function popEvent (state, preserveItems) {
      var this$1 = this;

    if (this.eventCount == 0) { return null }

    var end = this.items.length;
    for (;; end--) {
      var next = this$1.items.get(end - 1);
      if (next.selection) { --end; break }
    }

    var remap, mapFrom;
    if (preserveItems) {
      remap = this.remapping(end, this.items.length);
      mapFrom = remap.maps.length;
    }
    var transform = state.tr;
    var selection, remaining;
    var addAfter = [], addBefore = [];

    this.items.forEach(function (item, i) {
      if (!item.step) {
        if (!remap) {
          remap = this$1.remapping(end, i + 1);
          mapFrom = remap.maps.length;
        }
        mapFrom--;
        addBefore.push(item);
        return
      }

      if (remap) {
        addBefore.push(new Item(item.map));
        var step = item.step.map(remap.slice(mapFrom)), map;

        if (step && transform.maybeStep(step).doc) {
          map = transform.mapping.maps[transform.mapping.maps.length - 1];
          addAfter.push(new Item(map, null, null, addAfter.length + addBefore.length));
        }
        mapFrom--;
        if (map) { remap.appendMap(map, mapFrom); }
      } else {
        transform.maybeStep(item.step);
      }

      if (item.selection) {
        selection = remap ? item.selection.map(remap.slice(mapFrom)) : item.selection;
        remaining = new Branch(this$1.items.slice(0, end).append(addBefore.reverse().concat(addAfter)), this$1.eventCount - 1);
        return false
      }
    }, this.items.length, 0);

    return {remaining: remaining, transform: transform, selection: selection}
  };

  // : (Transform, ?SelectionBookmark, Object) → Branch
  // Create a new branch with the given transform added.
  Branch.prototype.addTransform = function addTransform (transform, selection, histOptions, preserveItems) {
    var newItems = [], eventCount = this.eventCount;
    var oldItems = this.items, lastItem = !preserveItems && oldItems.length ? oldItems.get(oldItems.length - 1) : null;

    for (var i = 0; i < transform.steps.length; i++) {
      var step = transform.steps[i].invert(transform.docs[i]);
      var item = new Item(transform.mapping.maps[i], step, selection), merged = (void 0);
      if (merged = lastItem && lastItem.merge(item)) {
        item = merged;
        if (i) { newItems.pop(); }
        else { oldItems = oldItems.slice(0, oldItems.length - 1); }
      }
      newItems.push(item);
      if (selection) {
        eventCount++;
        selection = null;
      }
      if (!preserveItems) { lastItem = item; }
    }
    var overflow = eventCount - histOptions.depth;
    if (overflow > DEPTH_OVERFLOW) {
      oldItems = cutOffEvents(oldItems, overflow);
      eventCount -= overflow;
    }
    return new Branch(oldItems.append(newItems), eventCount)
  };

  Branch.prototype.remapping = function remapping (from, to) {
    var maps = new prosemirrorTransform.Mapping;
    this.items.forEach(function (item, i) {
      var mirrorPos = item.mirrorOffset != null && i - item.mirrorOffset >= from
          ? mirrorPos = maps.maps.length - item.mirrorOffset : null;
      maps.appendMap(item.map, mirrorPos);
    }, from, to);
    return maps
  };

  Branch.prototype.addMaps = function addMaps (array) {
    if (this.eventCount == 0) { return this }
    return new Branch(this.items.append(array.map(function (map) { return new Item(map); })), this.eventCount)
  };

  // : (Transform, number)
  // When the collab module receives remote changes, the history has
  // to know about those, so that it can adjust the steps that were
  // rebased on top of the remote changes, and include the position
  // maps for the remote changes in its array of items.
  Branch.prototype.rebased = function rebased (rebasedTransform, rebasedCount) {
    if (!this.eventCount) { return this }

    var rebasedItems = [], start = Math.max(0, this.items.length - rebasedCount);

    var mapping = rebasedTransform.mapping;
    var newUntil = rebasedTransform.steps.length;
    var eventCount = this.eventCount;
    this.items.forEach(function (item) { if (item.selection) { eventCount--; } }, start);

    var iRebased = rebasedCount;
    this.items.forEach(function (item) {
      var pos = mapping.getMirror(--iRebased);
      if (pos == null) { return }
      newUntil = Math.min(newUntil, pos);
      var map = mapping.maps[pos];
      if (item.step) {
        var step = rebasedTransform.steps[pos].invert(rebasedTransform.docs[pos]);
        var selection = item.selection && item.selection.map(mapping.slice(iRebased + 1, pos));
        if (selection) { eventCount++; }
        rebasedItems.push(new Item(map, step, selection));
      } else {
        rebasedItems.push(new Item(map));
      }
    }, start);

    var newMaps = [];
    for (var i = rebasedCount; i < newUntil; i++)
      { newMaps.push(new Item(mapping.maps[i])); }
    var items = this.items.slice(0, start).append(newMaps).append(rebasedItems);
    var branch = new Branch(items, eventCount);

    if (branch.emptyItemCount() > max_empty_items)
      { branch = branch.compress(this.items.length - rebasedItems.length); }
    return branch
  };

  Branch.prototype.emptyItemCount = function emptyItemCount () {
    var count = 0;
    this.items.forEach(function (item) { if (!item.step) { count++; } });
    return count
  };

  // Compressing a branch means rewriting it to push the air (map-only
  // items) out. During collaboration, these naturally accumulate
  // because each remote change adds one. The `upto` argument is used
  // to ensure that only the items below a given level are compressed,
  // because `rebased` relies on a clean, untouched set of items in
  // order to associate old items with rebased steps.
  Branch.prototype.compress = function compress (upto) {
      if ( upto === void 0 ) upto = this.items.length;

    var remap = this.remapping(0, upto), mapFrom = remap.maps.length;
    var items = [], events = 0;
    this.items.forEach(function (item, i) {
      if (i >= upto) {
        items.push(item);
        if (item.selection) { events++; }
      } else if (item.step) {
        var step = item.step.map(remap.slice(mapFrom)), map = step && step.getMap();
        mapFrom--;
        if (map) { remap.appendMap(map, mapFrom); }
        if (step) {
          var selection = item.selection && item.selection.map(remap.slice(mapFrom));
          if (selection) { events++; }
          var newItem = new Item(map.invert(), step, selection), merged, last = items.length - 1;
          if (merged = items.length && items[last].merge(newItem))
            { items[last] = merged; }
          else
            { items.push(newItem); }
        }
      } else if (item.map) {
        mapFrom--;
      }
    }, this.items.length, 0);
    return new Branch(RopeSequence.from(items.reverse()), events)
  };

  Branch.empty = new Branch(RopeSequence.empty, 0);

  function cutOffEvents(items, n) {
    var cutPoint;
    items.forEach(function (item, i) {
      if (item.selection && (n-- == 0)) {
        cutPoint = i;
        return false
      }
    });
    return items.slice(cutPoint)
  }

  var Item = function Item(map, step, selection, mirrorOffset) {
    this.map = map;
    this.step = step;
    this.selection = selection;
    this.mirrorOffset = mirrorOffset;
  };

  Item.prototype.merge = function merge (other) {
    if (this.step && other.step && !other.selection) {
      var step = other.step.merge(this.step);
      if (step) { return new Item(step.getMap().invert(), step, this.selection) }
    }
  };

  // The value of the state field that tracks undo/redo history for that
  // state. Will be stored in the plugin state when the history plugin
  // is active.
  var HistoryState = function HistoryState(done, undone, prevRanges, prevTime) {
    this.done = done;
    this.undone = undone;
    this.prevRanges = prevRanges;
    this.prevTime = prevTime;
  };

  var DEPTH_OVERFLOW = 20;

  // : (HistoryState, EditorState, Transaction, Object)
  // Record a transformation in undo history.
  function applyTransaction(history, state, tr, options) {
    var historyTr = tr.getMeta(historyKey), rebased;
    if (historyTr) { return historyTr.historyState }

    if (tr.getMeta(closeHistoryKey)) { history = new HistoryState(history.done, history.undone, null, 0); }

    var appended = tr.getMeta("appendedTransaction");

    if (tr.steps.length == 0) {
      return history
    } else if (appended && appended.getMeta(historyKey)) {
      if (appended.getMeta(historyKey).redo)
        { return new HistoryState(history.done.addTransform(tr, null, options, mustPreserveItems(state)),
                                history.undone, rangesFor(tr.mapping.maps[tr.steps.length - 1]), history.prevTime) }
      else
        { return new HistoryState(history.done, history.undone.addTransform(tr, null, options, mustPreserveItems(state)),
                                null, history.prevTime) }
    } else if (tr.getMeta("addToHistory") !== false && !(appended && appended.getMeta("addToHistory") === false)) {
      // Group transforms that occur in quick succession into one event.
      var newGroup = history.prevTime < (tr.time || 0) - options.newGroupDelay ||
          !appended && !isAdjacentTo(tr, history.prevRanges);
      var prevRanges = appended ? mapRanges(history.prevRanges, tr.mapping) : rangesFor(tr.mapping.maps[tr.steps.length - 1]);
      return new HistoryState(history.done.addTransform(tr, newGroup ? state.selection.getBookmark() : null,
                                                        options, mustPreserveItems(state)),
                              Branch.empty, prevRanges, tr.time)
    } else if (rebased = tr.getMeta("rebased")) {
      // Used by the collab module to tell the history that some of its
      // content has been rebased.
      return new HistoryState(history.done.rebased(tr, rebased),
                              history.undone.rebased(tr, rebased),
                              mapRanges(history.prevRanges, tr.mapping), history.prevTime)
    } else {
      return new HistoryState(history.done.addMaps(tr.mapping.maps),
                              history.undone.addMaps(tr.mapping.maps),
                              mapRanges(history.prevRanges, tr.mapping), history.prevTime)
    }
  }

  function isAdjacentTo(transform, prevRanges) {
    if (!prevRanges) { return false }
    if (!transform.docChanged) { return true }
    var adjacent = false;
    transform.mapping.maps[0].forEach(function (start, end) {
      for (var i = 0; i < prevRanges.length; i += 2)
        { if (start <= prevRanges[i + 1] && end >= prevRanges[i])
          { adjacent = true; } }
    });
    return adjacent
  }

  function rangesFor(map) {
    var result = [];
    map.forEach(function (_from, _to, from, to) { return result.push(from, to); });
    return result
  }

  function mapRanges(ranges, mapping) {
    if (!ranges) { return null }
    var result = [];
    for (var i = 0; i < ranges.length; i += 2) {
      var from = mapping.map(ranges[i], 1), to = mapping.map(ranges[i + 1], -1);
      if (from <= to) { result.push(from, to); }
    }
    return result
  }

  // : (HistoryState, EditorState, (tr: Transaction), bool)
  // Apply the latest event from one branch to the document and shift the event
  // onto the other branch.
  function histTransaction(history, state, dispatch, redo) {
    var preserveItems = mustPreserveItems(state), histOptions = historyKey.get(state).spec.config;
    var pop = (redo ? history.undone : history.done).popEvent(state, preserveItems);
    if (!pop) { return }

    var selection = pop.selection.resolve(pop.transform.doc);
    var added = (redo ? history.done : history.undone).addTransform(pop.transform, state.selection.getBookmark(),
                                                                    histOptions, preserveItems);

    var newHist = new HistoryState(redo ? added : pop.remaining, redo ? pop.remaining : added, null, 0);
    dispatch(pop.transform.setSelection(selection).setMeta(historyKey, {redo: redo, historyState: newHist}).scrollIntoView());
  }

  var cachedPreserveItems = false;
  var cachedPreserveItemsPlugins = null;
  // Check whether any plugin in the given state has a
  // `historyPreserveItems` property in its spec, in which case we must
  // preserve steps exactly as they came in, so that they can be
  // rebased.
  function mustPreserveItems(state) {
    var plugins = state.plugins;
    if (cachedPreserveItemsPlugins != plugins) {
      cachedPreserveItems = false;
      cachedPreserveItemsPlugins = plugins;
      for (var i = 0; i < plugins.length; i++) { if (plugins[i].spec.historyPreserveItems) {
        cachedPreserveItems = true;
        break
      } }
    }
    return cachedPreserveItems
  }

  // :: (Transaction) → Transaction
  // Set a flag on the given transaction that will prevent further steps
  // from being appended to an existing history event (so that they
  // require a separate undo command to undo).
  function closeHistory(tr) {
    return tr.setMeta(closeHistoryKey, true)
  }

  var historyKey = new dist$3.PluginKey("history");
  var closeHistoryKey = new dist$3.PluginKey("closeHistory");

  // :: (?Object) → Plugin
  // Returns a plugin that enables the undo history for an editor. The
  // plugin will track undo and redo stacks, which can be used with the
  // [`undo`](#history.undo) and [`redo`](#history.redo) commands.
  //
  // You can set an `"addToHistory"` [metadata
  // property](#state.Transaction.setMeta) of `false` on a transaction
  // to prevent it from being rolled back by undo.
  //
  //   config::-
  //   Supports the following configuration options:
  //
  //     depth:: ?number
  //     The amount of history events that are collected before the
  //     oldest events are discarded. Defaults to 100.
  //
  //     newGroupDelay:: ?number
  //     The delay between changes after which a new group should be
  //     started. Defaults to 500 (milliseconds). Note that when changes
  //     aren't adjacent, a new group is always started.
  function history(config) {
    config = {depth: config && config.depth || 100,
              newGroupDelay: config && config.newGroupDelay || 500};
    return new dist$3.Plugin({
      key: historyKey,

      state: {
        init: function init() {
          return new HistoryState(Branch.empty, Branch.empty, null, 0)
        },
        apply: function apply(tr, hist, state) {
          return applyTransaction(hist, state, tr, config)
        }
      },

      config: config
    })
  }

  // :: (EditorState, ?(tr: Transaction)) → bool
  // A command function that undoes the last change, if any.
  function undo(state, dispatch) {
    var hist = historyKey.getState(state);
    if (!hist || hist.done.eventCount == 0) { return false }
    if (dispatch) { histTransaction(hist, state, dispatch, false); }
    return true
  }

  // :: (EditorState, ?(tr: Transaction)) → bool
  // A command function that redoes the last undone change, if any.
  function redo(state, dispatch) {
    var hist = historyKey.getState(state);
    if (!hist || hist.undone.eventCount == 0) { return false }
    if (dispatch) { histTransaction(hist, state, dispatch, true); }
    return true
  }

  // :: (EditorState) → number
  // The amount of undoable events available in a given state.
  function undoDepth(state) {
    var hist = historyKey.getState(state);
    return hist ? hist.done.eventCount : 0
  }

  // :: (EditorState) → number
  // The amount of redoable events available in a given editor state.
  function redoDepth(state) {
    var hist = historyKey.getState(state);
    return hist ? hist.undone.eventCount : 0
  }

  exports.HistoryState = HistoryState;
  exports.closeHistory = closeHistory;
  exports.history = history;
  exports.undo = undo;
  exports.redo = redo;
  exports.undoDepth = undoDepth;
  exports.redoDepth = redoDepth;

  });

  var history = unwrapExports(history_1);
  var history_2 = history_1.HistoryState;
  var history_3 = history_1.closeHistory;
  var history_4 = history_1.history;
  var history_5 = history_1.undo;
  var history_6 = history_1.redo;
  var history_7 = history_1.undoDepth;
  var history_8 = history_1.redoDepth;

  var history$1 = /*#__PURE__*/Object.freeze({
    'default': history,
    __moduleExports: history_1,
    HistoryState: history_2,
    closeHistory: history_3,
    history: history_4,
    undo: history_5,
    redo: history_6,
    undoDepth: history_7,
    redoDepth: history_8
  });

  var commands = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, '__esModule', { value: true });





  // :: (EditorState, ?(tr: Transaction)) → bool
  // Delete the selection, if there is one.
  function deleteSelection(state, dispatch) {
    if (state.selection.empty) { return false }
    if (dispatch) { dispatch(state.tr.deleteSelection().scrollIntoView()); }
    return true
  }

  // :: (EditorState, ?(tr: Transaction), ?EditorView) → bool
  // If the selection is empty and at the start of a textblock, try to
  // reduce the distance between that block and the one before it—if
  // there's a block directly before it that can be joined, join them.
  // If not, try to move the selected block closer to the next one in
  // the document structure by lifting it out of its parent or moving it
  // into a parent of the previous block. Will use the view for accurate
  // (bidi-aware) start-of-textblock detection if given.
  function joinBackward(state, dispatch, view) {
    var ref = state.selection;
    var $cursor = ref.$cursor;
    if (!$cursor || (view ? !view.endOfTextblock("backward", state)
                          : $cursor.parentOffset > 0))
      { return false }

    var $cut = findCutBefore($cursor);

    // If there is no node before this, try to lift
    if (!$cut) {
      var range = $cursor.blockRange(), target = range && prosemirrorTransform.liftTarget(range);
      if (target == null) { return false }
      if (dispatch) { dispatch(state.tr.lift(range, target).scrollIntoView()); }
      return true
    }

    var before = $cut.nodeBefore;
    // Apply the joining algorithm
    if (!before.type.spec.isolating && deleteBarrier(state, $cut, dispatch))
      { return true }

    // If the node below has no content and the node above is
    // selectable, delete the node below and select the one above.
    if ($cursor.parent.content.size == 0 &&
        (textblockAt(before, "end") || dist$3.NodeSelection.isSelectable(before))) {
      if (dispatch) {
        var tr = state.tr.deleteRange($cursor.before(), $cursor.after());
        tr.setSelection(textblockAt(before, "end") ? dist$3.Selection.findFrom(tr.doc.resolve(tr.mapping.map($cut.pos, -1)), -1)
                        : dist$3.NodeSelection.create(tr.doc, $cut.pos - before.nodeSize));
        dispatch(tr.scrollIntoView());
      }
      return true
    }

    // If the node before is an atom, delete it
    if (before.isAtom && $cut.depth == $cursor.depth - 1) {
      if (dispatch) { dispatch(state.tr.delete($cut.pos - before.nodeSize, $cut.pos).scrollIntoView()); }
      return true
    }

    return false
  }

  function textblockAt(node, side) {
    for (; node; node = (side == "start" ? node.firstChild : node.lastChild))
      { if (node.isTextblock) { return true } }
    return false
  }

  // :: (EditorState, ?(tr: Transaction), ?EditorView) → bool
  // When the selection is empty and at the start of a textblock, select
  // the node before that textblock, if possible. This is intended to be
  // bound to keys like backspace, after
  // [`joinBackward`](#commands.joinBackward) or other deleting
  // commands, as a fall-back behavior when the schema doesn't allow
  // deletion at the selected point.
  function selectNodeBackward(state, dispatch, view) {
    var ref = state.selection;
    var $cursor = ref.$cursor;
    if (!$cursor || (view ? !view.endOfTextblock("backward", state)
                          : $cursor.parentOffset > 0))
      { return false }

    var $cut = findCutBefore($cursor), node = $cut && $cut.nodeBefore;
    if (!node || !dist$3.NodeSelection.isSelectable(node)) { return false }
    if (dispatch)
      { dispatch(state.tr.setSelection(dist$3.NodeSelection.create(state.doc, $cut.pos - node.nodeSize)).scrollIntoView()); }
    return true
  }

  function findCutBefore($pos) {
    if (!$pos.parent.type.spec.isolating) { for (var i = $pos.depth - 1; i >= 0; i--) {
      if ($pos.index(i) > 0) { return $pos.doc.resolve($pos.before(i + 1)) }
      if ($pos.node(i).type.spec.isolating) { break }
    } }
    return null
  }

  // :: (EditorState, ?(tr: Transaction), ?EditorView) → bool
  // If the selection is empty and the cursor is at the end of a
  // textblock, try to reduce or remove the boundary between that block
  // and the one after it, either by joining them or by moving the other
  // block closer to this one in the tree structure. Will use the view
  // for accurate start-of-textblock detection if given.
  function joinForward(state, dispatch, view) {
    var ref = state.selection;
    var $cursor = ref.$cursor;
    if (!$cursor || (view ? !view.endOfTextblock("forward", state)
                          : $cursor.parentOffset < $cursor.parent.content.size))
      { return false }

    var $cut = findCutAfter($cursor);

    // If there is no node after this, there's nothing to do
    if (!$cut) { return false }

    var after = $cut.nodeAfter;
    // Try the joining algorithm
    if (deleteBarrier(state, $cut, dispatch)) { return true }

    // If the node above has no content and the node below is
    // selectable, delete the node above and select the one below.
    if ($cursor.parent.content.size == 0 &&
        (textblockAt(after, "start") || dist$3.NodeSelection.isSelectable(after))) {
      if (dispatch) {
        var tr = state.tr.deleteRange($cursor.before(), $cursor.after());
        tr.setSelection(textblockAt(after, "start") ? dist$3.Selection.findFrom(tr.doc.resolve(tr.mapping.map($cut.pos)), 1)
                        : dist$3.NodeSelection.create(tr.doc, tr.mapping.map($cut.pos)));
        dispatch(tr.scrollIntoView());
      }
      return true
    }

    // If the next node is an atom, delete it
    if (after.isAtom && $cut.depth == $cursor.depth - 1) {
      if (dispatch) { dispatch(state.tr.delete($cut.pos, $cut.pos + after.nodeSize).scrollIntoView()); }
      return true
    }

    return false
  }

  // :: (EditorState, ?(tr: Transaction), ?EditorView) → bool
  // When the selection is empty and at the end of a textblock, select
  // the node coming after that textblock, if possible. This is intended
  // to be bound to keys like delete, after
  // [`joinForward`](#commands.joinForward) and similar deleting
  // commands, to provide a fall-back behavior when the schema doesn't
  // allow deletion at the selected point.
  function selectNodeForward(state, dispatch, view) {
    var ref = state.selection;
    var $cursor = ref.$cursor;
    if (!$cursor || (view ? !view.endOfTextblock("forward", state)
                          : $cursor.parentOffset < $cursor.parent.content.size))
      { return false }

    var $cut = findCutAfter($cursor), node = $cut && $cut.nodeAfter;
    if (!node || !dist$3.NodeSelection.isSelectable(node)) { return false }
    if (dispatch)
      { dispatch(state.tr.setSelection(dist$3.NodeSelection.create(state.doc, $cut.pos)).scrollIntoView()); }
    return true
  }

  function findCutAfter($pos) {
    if (!$pos.parent.type.spec.isolating) { for (var i = $pos.depth - 1; i >= 0; i--) {
      var parent = $pos.node(i);
      if ($pos.index(i) + 1 < parent.childCount) { return $pos.doc.resolve($pos.after(i + 1)) }
      if (parent.type.spec.isolating) { break }
    } }
    return null
  }

  // :: (EditorState, ?(tr: Transaction)) → bool
  // Join the selected block or, if there is a text selection, the
  // closest ancestor block of the selection that can be joined, with
  // the sibling above it.
  function joinUp(state, dispatch) {
    var sel = state.selection, nodeSel = sel instanceof dist$3.NodeSelection, point;
    if (nodeSel) {
      if (sel.node.isTextblock || !prosemirrorTransform.canJoin(state.doc, sel.from)) { return false }
      point = sel.from;
    } else {
      point = prosemirrorTransform.joinPoint(state.doc, sel.from, -1);
      if (point == null) { return false }
    }
    if (dispatch) {
      var tr = state.tr.join(point);
      if (nodeSel) { tr.setSelection(dist$3.NodeSelection.create(tr.doc, point - state.doc.resolve(point).nodeBefore.nodeSize)); }
      dispatch(tr.scrollIntoView());
    }
    return true
  }

  // :: (EditorState, ?(tr: Transaction)) → bool
  // Join the selected block, or the closest ancestor of the selection
  // that can be joined, with the sibling after it.
  function joinDown(state, dispatch) {
    var sel = state.selection, point;
    if (sel instanceof dist$3.NodeSelection) {
      if (sel.node.isTextblock || !prosemirrorTransform.canJoin(state.doc, sel.to)) { return false }
      point = sel.to;
    } else {
      point = prosemirrorTransform.joinPoint(state.doc, sel.to, 1);
      if (point == null) { return false }
    }
    if (dispatch)
      { dispatch(state.tr.join(point).scrollIntoView()); }
    return true
  }

  // :: (EditorState, ?(tr: Transaction)) → bool
  // Lift the selected block, or the closest ancestor block of the
  // selection that can be lifted, out of its parent node.
  function lift(state, dispatch) {
    var ref = state.selection;
    var $from = ref.$from;
    var $to = ref.$to;
    var range = $from.blockRange($to), target = range && prosemirrorTransform.liftTarget(range);
    if (target == null) { return false }
    if (dispatch) { dispatch(state.tr.lift(range, target).scrollIntoView()); }
    return true
  }

  // :: (EditorState, ?(tr: Transaction)) → bool
  // If the selection is in a node whose type has a truthy
  // [`code`](#model.NodeSpec.code) property in its spec, replace the
  // selection with a newline character.
  function newlineInCode(state, dispatch) {
    var ref = state.selection;
    var $head = ref.$head;
    var $anchor = ref.$anchor;
    if (!$head.parent.type.spec.code || !$head.sameParent($anchor)) { return false }
    if (dispatch) { dispatch(state.tr.insertText("\n").scrollIntoView()); }
    return true
  }

  // :: (EditorState, ?(tr: Transaction)) → bool
  // When the selection is in a node with a truthy
  // [`code`](#model.NodeSpec.code) property in its spec, create a
  // default block after the code block, and move the cursor there.
  function exitCode(state, dispatch) {
    var ref = state.selection;
    var $head = ref.$head;
    var $anchor = ref.$anchor;
    if (!$head.parent.type.spec.code || !$head.sameParent($anchor)) { return false }
    var above = $head.node(-1), after = $head.indexAfter(-1), type = above.contentMatchAt(after).defaultType;
    if (!above.canReplaceWith(after, after, type)) { return false }
    if (dispatch) {
      var pos = $head.after(), tr = state.tr.replaceWith(pos, pos, type.createAndFill());
      tr.setSelection(dist$3.Selection.near(tr.doc.resolve(pos), 1));
      dispatch(tr.scrollIntoView());
    }
    return true
  }

  // :: (EditorState, ?(tr: Transaction)) → bool
  // If a block node is selected, create an empty paragraph before (if
  // it is its parent's first child) or after it.
  function createParagraphNear(state, dispatch) {
    var ref = state.selection;
    var $from = ref.$from;
    var $to = ref.$to;
    if ($from.parent.inlineContent || $to.parent.inlineContent) { return false }
    var type = $from.parent.contentMatchAt($to.indexAfter()).defaultType;
    if (!type || !type.isTextblock) { return false }
    if (dispatch) {
      var side = (!$from.parentOffset && $to.index() < $to.parent.childCount ? $from : $to).pos;
      var tr = state.tr.insert(side, type.createAndFill());
      tr.setSelection(dist$3.TextSelection.create(tr.doc, side + 1));
      dispatch(tr.scrollIntoView());
    }
    return true
  }

  // :: (EditorState, ?(tr: Transaction)) → bool
  // If the cursor is in an empty textblock that can be lifted, lift the
  // block.
  function liftEmptyBlock(state, dispatch) {
    var ref = state.selection;
    var $cursor = ref.$cursor;
    if (!$cursor || $cursor.parent.content.size) { return false }
    if ($cursor.depth > 1 && $cursor.after() != $cursor.end(-1)) {
      var before = $cursor.before();
      if (prosemirrorTransform.canSplit(state.doc, before)) {
        if (dispatch) { dispatch(state.tr.split(before).scrollIntoView()); }
        return true
      }
    }
    var range = $cursor.blockRange(), target = range && prosemirrorTransform.liftTarget(range);
    if (target == null) { return false }
    if (dispatch) { dispatch(state.tr.lift(range, target).scrollIntoView()); }
    return true
  }

  // :: (EditorState, ?(tr: Transaction)) → bool
  // Split the parent block of the selection. If the selection is a text
  // selection, also delete its content.
  function splitBlock(state, dispatch) {
    var ref = state.selection;
    var $from = ref.$from;
    var $to = ref.$to;
    if (state.selection instanceof dist$3.NodeSelection && state.selection.node.isBlock) {
      if (!$from.parentOffset || !prosemirrorTransform.canSplit(state.doc, $from.pos)) { return false }
      if (dispatch) { dispatch(state.tr.split($from.pos).scrollIntoView()); }
      return true
    }

    if (!$from.parent.isBlock) { return false }

    if (dispatch) {
      var atEnd = $to.parentOffset == $to.parent.content.size;
      var tr = state.tr;
      if (state.selection instanceof dist$3.TextSelection) { tr.deleteSelection(); }
      var deflt = $from.depth == 0 ? null : $from.node(-1).contentMatchAt($from.indexAfter(-1)).defaultType;
      var types = atEnd && deflt ? [{type: deflt}] : null;
      var can = prosemirrorTransform.canSplit(tr.doc, tr.mapping.map($from.pos), 1, types);
      if (!types && !can && prosemirrorTransform.canSplit(tr.doc, tr.mapping.map($from.pos), 1, deflt && [{type: deflt}])) {
        types = [{type: deflt}];
        can = true;
      }
      if (can) {
        tr.split(tr.mapping.map($from.pos), 1, types);
        if (!atEnd && !$from.parentOffset && $from.parent.type != deflt &&
            $from.node(-1).canReplace($from.index(-1), $from.indexAfter(-1), dist.Fragment.from(deflt.create(), $from.parent)))
          { tr.setNodeMarkup(tr.mapping.map($from.before()), deflt); }
      }
      dispatch(tr.scrollIntoView());
    }
    return true
  }

  // :: (EditorState, ?(tr: Transaction)) → bool
  // Acts like [`splitBlock`](#commands.splitBlock), but without
  // resetting the set of active marks at the cursor.
  function splitBlockKeepMarks(state, dispatch) {
    return splitBlock(state, dispatch && (function (tr) {
      var marks = state.storedMarks || (state.selection.$to.parentOffset && state.selection.$from.marks());
      if (marks) { tr.ensureMarks(marks); }
      dispatch(tr);
    }))
  }

  // :: (EditorState, ?(tr: Transaction)) → bool
  // Move the selection to the node wrapping the current selection, if
  // any. (Will not select the document node.)
  function selectParentNode(state, dispatch) {
    var ref = state.selection;
    var $from = ref.$from;
    var to = ref.to;
    var pos;
    var same = $from.sharedDepth(to);
    if (same == 0) { return false }
    pos = $from.before(same);
    if (dispatch) { dispatch(state.tr.setSelection(dist$3.NodeSelection.create(state.doc, pos))); }
    return true
  }

  // :: (EditorState, ?(tr: Transaction)) → bool
  // Select the whole document.
  function selectAll(state, dispatch) {
    if (dispatch) { dispatch(state.tr.setSelection(new dist$3.AllSelection(state.doc))); }
    return true
  }

  function joinMaybeClear(state, $pos, dispatch) {
    var before = $pos.nodeBefore, after = $pos.nodeAfter, index = $pos.index();
    if (!before || !after || !before.type.compatibleContent(after.type)) { return false }
    if (!before.content.size && $pos.parent.canReplace(index - 1, index)) {
      if (dispatch) { dispatch(state.tr.delete($pos.pos - before.nodeSize, $pos.pos).scrollIntoView()); }
      return true
    }
    if (!$pos.parent.canReplace(index, index + 1) || !(after.isTextblock || prosemirrorTransform.canJoin(state.doc, $pos.pos)))
      { return false }
    if (dispatch)
      { dispatch(state.tr
               .clearIncompatible($pos.pos, before.type, before.contentMatchAt(before.childCount))
               .join($pos.pos)
               .scrollIntoView()); }
    return true
  }

  function deleteBarrier(state, $cut, dispatch) {
    var before = $cut.nodeBefore, after = $cut.nodeAfter, conn, match;
    if (before.type.spec.isolating || after.type.spec.isolating) { return false }
    if (joinMaybeClear(state, $cut, dispatch)) { return true }

    if ($cut.parent.canReplace($cut.index(), $cut.index() + 1) &&
        (conn = (match = before.contentMatchAt(before.childCount)).findWrapping(after.type)) &&
        match.matchType(conn[0] || after.type).validEnd) {
      if (dispatch) {
        var end = $cut.pos + after.nodeSize, wrap = dist.Fragment.empty;
        for (var i = conn.length - 1; i >= 0; i--)
          { wrap = dist.Fragment.from(conn[i].create(null, wrap)); }
        wrap = dist.Fragment.from(before.copy(wrap));
        var tr = state.tr.step(new prosemirrorTransform.ReplaceAroundStep($cut.pos - 1, end, $cut.pos, end, new dist.Slice(wrap, 1, 0), conn.length, true));
        var joinAt = end + 2 * conn.length;
        if (prosemirrorTransform.canJoin(tr.doc, joinAt)) { tr.join(joinAt); }
        dispatch(tr.scrollIntoView());
      }
      return true
    }

    var selAfter = dist$3.Selection.findFrom($cut, 1);
    var range = selAfter && selAfter.$from.blockRange(selAfter.$to), target = range && prosemirrorTransform.liftTarget(range);
    if (target != null && target >= $cut.depth) {
      if (dispatch) { dispatch(state.tr.lift(range, target).scrollIntoView()); }
      return true
    }

    return false
  }

  // Parameterized commands

  // :: (NodeType, ?Object) → (state: EditorState, dispatch: ?(tr: Transaction)) → bool
  // Wrap the selection in a node of the given type with the given
  // attributes.
  function wrapIn(nodeType, attrs) {
    return function(state, dispatch) {
      var ref = state.selection;
      var $from = ref.$from;
      var $to = ref.$to;
      var range = $from.blockRange($to), wrapping = range && prosemirrorTransform.findWrapping(range, nodeType, attrs);
      if (!wrapping) { return false }
      if (dispatch) { dispatch(state.tr.wrap(range, wrapping).scrollIntoView()); }
      return true
    }
  }

  // :: (NodeType, ?Object) → (state: EditorState, dispatch: ?(tr: Transaction)) → bool
  // Returns a command that tries to set the selected textblocks to the
  // given node type with the given attributes.
  function setBlockType(nodeType, attrs) {
    return function(state, dispatch) {
      var ref = state.selection;
      var from = ref.from;
      var to = ref.to;
      var applicable = false;
      state.doc.nodesBetween(from, to, function (node, pos) {
        if (applicable) { return false }
        if (!node.isTextblock || node.hasMarkup(nodeType, attrs)) { return }
        if (node.type == nodeType) {
          applicable = true;
        } else {
          var $pos = state.doc.resolve(pos), index = $pos.index();
          applicable = $pos.parent.canReplaceWith(index, index + 1, nodeType);
        }
      });
      if (!applicable) { return false }
      if (dispatch) { dispatch(state.tr.setBlockType(from, to, nodeType, attrs).scrollIntoView()); }
      return true
    }
  }

  function markApplies(doc, ranges, type) {
    var loop = function ( i ) {
      var ref = ranges[i];
      var $from = ref.$from;
      var $to = ref.$to;
      var can = $from.depth == 0 ? doc.type.allowsMarkType(type) : false;
      doc.nodesBetween($from.pos, $to.pos, function (node) {
        if (can) { return false }
        can = node.inlineContent && node.type.allowsMarkType(type);
      });
      if (can) { return { v: true } }
    };

    for (var i = 0; i < ranges.length; i++) {
      var returned = loop( i );

      if ( returned ) return returned.v;
    }
    return false
  }

  // :: (MarkType, ?Object) → (state: EditorState, dispatch: ?(tr: Transaction)) → bool
  // Create a command function that toggles the given mark with the
  // given attributes. Will return `false` when the current selection
  // doesn't support that mark. This will remove the mark if any marks
  // of that type exist in the selection, or add it otherwise. If the
  // selection is empty, this applies to the [stored
  // marks](#state.EditorState.storedMarks) instead of a range of the
  // document.
  function toggleMark(markType, attrs) {
    return function(state, dispatch) {
      var ref = state.selection;
      var empty = ref.empty;
      var $cursor = ref.$cursor;
      var ranges = ref.ranges;
      if ((empty && !$cursor) || !markApplies(state.doc, ranges, markType)) { return false }
      if (dispatch) {
        if ($cursor) {
          if (markType.isInSet(state.storedMarks || $cursor.marks()))
            { dispatch(state.tr.removeStoredMark(markType)); }
          else
            { dispatch(state.tr.addStoredMark(markType.create(attrs))); }
        } else {
          var has = false, tr = state.tr;
          for (var i = 0; !has && i < ranges.length; i++) {
            var ref$1 = ranges[i];
            var $from = ref$1.$from;
            var $to = ref$1.$to;
            has = state.doc.rangeHasMark($from.pos, $to.pos, markType);
          }
          for (var i$1 = 0; i$1 < ranges.length; i$1++) {
            var ref$2 = ranges[i$1];
            var $from$1 = ref$2.$from;
            var $to$1 = ref$2.$to;
            if (has) { tr.removeMark($from$1.pos, $to$1.pos, markType); }
            else { tr.addMark($from$1.pos, $to$1.pos, markType.create(attrs)); }
          }
          dispatch(tr.scrollIntoView());
        }
      }
      return true
    }
  }

  function wrapDispatchForJoin(dispatch, isJoinable) {
    return function (tr) {
      if (!tr.isGeneric) { return dispatch(tr) }

      var ranges = [];
      for (var i = 0; i < tr.mapping.maps.length; i++) {
        var map = tr.mapping.maps[i];
        for (var j = 0; j < ranges.length; j++)
          { ranges[j] = map.map(ranges[j]); }
        map.forEach(function (_s, _e, from, to) { return ranges.push(from, to); });
      }

      // Figure out which joinable points exist inside those ranges,
      // by checking all node boundaries in their parent nodes.
      var joinable = [];
      for (var i$1 = 0; i$1 < ranges.length; i$1 += 2) {
        var from = ranges[i$1], to = ranges[i$1 + 1];
        var $from = tr.doc.resolve(from), depth = $from.sharedDepth(to), parent = $from.node(depth);
        for (var index = $from.indexAfter(depth), pos = $from.after(depth + 1); pos <= to; ++index) {
          var after = parent.maybeChild(index);
          if (!after) { break }
          if (index && joinable.indexOf(pos) == -1) {
            var before = parent.child(index - 1);
            if (before.type == after.type && isJoinable(before, after))
              { joinable.push(pos); }
          }
          pos += after.nodeSize;
        }
      }
      // Join the joinable points
      joinable.sort(function (a, b) { return a - b; });
      for (var i$2 = joinable.length - 1; i$2 >= 0; i$2--) {
        if (prosemirrorTransform.canJoin(tr.doc, joinable[i$2])) { tr.join(joinable[i$2]); }
      }
      dispatch(tr);
    }
  }

  // :: ((state: EditorState, ?(tr: Transaction)) → bool, union<(before: Node, after: Node) → bool, [string]>) → (state: EditorState, ?(tr: Transaction)) → bool
  // Wrap a command so that, when it produces a transform that causes
  // two joinable nodes to end up next to each other, those are joined.
  // Nodes are considered joinable when they are of the same type and
  // when the `isJoinable` predicate returns true for them or, if an
  // array of strings was passed, if their node type name is in that
  // array.
  function autoJoin(command, isJoinable) {
    if (Array.isArray(isJoinable)) {
      var types = isJoinable;
      isJoinable = function (node) { return types.indexOf(node.type.name) > -1; };
    }
    return function (state, dispatch) { return command(state, dispatch && wrapDispatchForJoin(dispatch, isJoinable)); }
  }

  // :: (...[(EditorState, ?(tr: Transaction), ?EditorView) → bool]) → (EditorState, ?(tr: Transaction), ?EditorView) → bool
  // Combine a number of command functions into a single function (which
  // calls them one by one until one returns true).
  function chainCommands() {
    var commands = [], len = arguments.length;
    while ( len-- ) commands[ len ] = arguments[ len ];

    return function(state, dispatch, view) {
      for (var i = 0; i < commands.length; i++)
        { if (commands[i](state, dispatch, view)) { return true } }
      return false
    }
  }

  var backspace = chainCommands(deleteSelection, joinBackward, selectNodeBackward);
  var del = chainCommands(deleteSelection, joinForward, selectNodeForward);

  // :: Object
  // A basic keymap containing bindings not specific to any schema.
  // Binds the following keys (when multiple commands are listed, they
  // are chained with [`chainCommands`](#commands.chainCommands)):
  //
  // * **Enter** to `newlineInCode`, `createParagraphNear`, `liftEmptyBlock`, `splitBlock`
  // * **Mod-Enter** to `exitCode`
  // * **Backspace** and **Mod-Backspace** to `deleteSelection`, `joinBackward`, `selectNodeBackward`
  // * **Delete** and **Mod-Delete** to `deleteSelection`, `joinForward`, `selectNodeForward`
  // * **Mod-Delete** to `deleteSelection`, `joinForward`, `selectNodeForward`
  // * **Mod-a** to `selectAll`
  var pcBaseKeymap = {
    "Enter": chainCommands(newlineInCode, createParagraphNear, liftEmptyBlock, splitBlock),
    "Mod-Enter": exitCode,
    "Backspace": backspace,
    "Mod-Backspace": backspace,
    "Delete": del,
    "Mod-Delete": del,
    "Mod-a": selectAll
  };

  // :: Object
  // A copy of `pcBaseKeymap` that also binds **Ctrl-h** like Backspace,
  // **Ctrl-d** like Delete, **Alt-Backspace** like Ctrl-Backspace, and
  // **Ctrl-Alt-Backspace**, **Alt-Delete**, and **Alt-d** like
  // Ctrl-Delete.
  var macBaseKeymap = {
    "Ctrl-h": pcBaseKeymap["Backspace"],
    "Alt-Backspace": pcBaseKeymap["Mod-Backspace"],
    "Ctrl-d": pcBaseKeymap["Delete"],
    "Ctrl-Alt-Backspace": pcBaseKeymap["Mod-Delete"],
    "Alt-Delete": pcBaseKeymap["Mod-Delete"],
    "Alt-d": pcBaseKeymap["Mod-Delete"]
  };
  for (var key in pcBaseKeymap) { macBaseKeymap[key] = pcBaseKeymap[key]; }

  // declare global: os, navigator
  var mac = typeof navigator != "undefined" ? /Mac/.test(navigator.platform)
            : typeof os != "undefined" ? os.platform() == "darwin" : false;

  // :: Object
  // Depending on the detected platform, this will hold
  // [`pcBasekeymap`](#commands.pcBaseKeymap) or
  // [`macBaseKeymap`](#commands.macBaseKeymap).
  var baseKeymap = mac ? macBaseKeymap : pcBaseKeymap;

  exports.deleteSelection = deleteSelection;
  exports.joinBackward = joinBackward;
  exports.selectNodeBackward = selectNodeBackward;
  exports.joinForward = joinForward;
  exports.selectNodeForward = selectNodeForward;
  exports.joinUp = joinUp;
  exports.joinDown = joinDown;
  exports.lift = lift;
  exports.newlineInCode = newlineInCode;
  exports.exitCode = exitCode;
  exports.createParagraphNear = createParagraphNear;
  exports.liftEmptyBlock = liftEmptyBlock;
  exports.splitBlock = splitBlock;
  exports.splitBlockKeepMarks = splitBlockKeepMarks;
  exports.selectParentNode = selectParentNode;
  exports.selectAll = selectAll;
  exports.wrapIn = wrapIn;
  exports.setBlockType = setBlockType;
  exports.toggleMark = toggleMark;
  exports.autoJoin = autoJoin;
  exports.chainCommands = chainCommands;
  exports.pcBaseKeymap = pcBaseKeymap;
  exports.macBaseKeymap = macBaseKeymap;
  exports.baseKeymap = baseKeymap;

  });

  var commands$1 = unwrapExports(commands);
  var commands_1 = commands.deleteSelection;
  var commands_2 = commands.joinBackward;
  var commands_3 = commands.selectNodeBackward;
  var commands_4 = commands.joinForward;
  var commands_5 = commands.selectNodeForward;
  var commands_6 = commands.joinUp;
  var commands_7 = commands.joinDown;
  var commands_8 = commands.lift;
  var commands_9 = commands.newlineInCode;
  var commands_10 = commands.exitCode;
  var commands_11 = commands.createParagraphNear;
  var commands_12 = commands.liftEmptyBlock;
  var commands_13 = commands.splitBlock;
  var commands_14 = commands.splitBlockKeepMarks;
  var commands_15 = commands.selectParentNode;
  var commands_16 = commands.selectAll;
  var commands_17 = commands.wrapIn;
  var commands_18 = commands.setBlockType;
  var commands_19 = commands.toggleMark;
  var commands_20 = commands.autoJoin;
  var commands_21 = commands.chainCommands;
  var commands_22 = commands.pcBaseKeymap;
  var commands_23 = commands.macBaseKeymap;
  var commands_24 = commands.baseKeymap;

  var commands$2 = /*#__PURE__*/Object.freeze({
    'default': commands$1,
    __moduleExports: commands,
    deleteSelection: commands_1,
    joinBackward: commands_2,
    selectNodeBackward: commands_3,
    joinForward: commands_4,
    selectNodeForward: commands_5,
    joinUp: commands_6,
    joinDown: commands_7,
    lift: commands_8,
    newlineInCode: commands_9,
    exitCode: commands_10,
    createParagraphNear: commands_11,
    liftEmptyBlock: commands_12,
    splitBlock: commands_13,
    splitBlockKeepMarks: commands_14,
    selectParentNode: commands_15,
    selectAll: commands_16,
    wrapIn: commands_17,
    setBlockType: commands_18,
    toggleMark: commands_19,
    autoJoin: commands_20,
    chainCommands: commands_21,
    pcBaseKeymap: commands_22,
    macBaseKeymap: commands_23,
    baseKeymap: commands_24
  });

  var dropcursor = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, '__esModule', { value: true });




  function dropCursor(options) {
    if ( options === void 0 ) options = {};

    return new dist$3.Plugin({
      view: function view(editorView) { return new DropCursorView(editorView, options) }
    })
  }

  var DropCursorView = function DropCursorView(editorView, options) {
    var this$1 = this;

    this.editorView = editorView;
    this.width = options.width || 1;
    this.color = options.color || "black";
    this.cursorPos = null;
    this.element = null;
    this.timeout = null;

    this.handlers = ["dragover", "dragend", "drop", "dragleave"].map(function (name) {
      var handler = function (e) { return this$1[name](e); };
      editorView.dom.addEventListener(name, handler);
      return {name: name, handler: handler}
    });
  };

  DropCursorView.prototype.destroy = function destroy () {
      var this$1 = this;

    this.handlers.forEach(function (ref) {
        var name = ref.name;
        var handler = ref.handler;

        return this$1.editorView.dom.removeEventListener(name, handler);
      });
  };

  DropCursorView.prototype.update = function update (editorView, prevState) {
    if (this.cursorPos != null && prevState.doc != editorView.state.doc) { this.updateOverlay(); }
  };

  DropCursorView.prototype.setCursor = function setCursor (pos) {
    if (pos == this.cursorPos) { return }
    this.cursorPos = pos;
    if (pos == null) {
      this.element.remove();
      this.element = null;
    } else {
      this.updateOverlay();
    }
  };

  DropCursorView.prototype.updateOverlay = function updateOverlay () {
    var $pos = this.editorView.state.doc.resolve(this.cursorPos), rect;
    if (!$pos.parent.inlineContent) {
      var before = $pos.nodeBefore, after = $pos.nodeAfter;
      if (before || after) {
        var nodeRect = this.editorView.nodeDOM(this.cursorPos - (before ?before.nodeSize : 0)).getBoundingClientRect();
        var top = before ? nodeRect.bottom : nodeRect.top;
        if (before && after)
          { top = (top + this.editorView.nodeDOM(this.cursorPos).getBoundingClientRect().top) / 2; }
        rect = {left: nodeRect.left, right: nodeRect.right, top: top - this.width / 2, bottom: top + this.width / 2};
      }
    }
    if (!rect) {
      var coords = this.editorView.coordsAtPos(this.cursorPos);
      rect = {left: coords.left - this.width / 2, right: coords.left + this.width / 2, top: coords.top, bottom: coords.bottom};
    }

    var parent = this.editorView.dom.offsetParent;
    if (!this.element) {
      this.element = parent.appendChild(document.createElement("div"));
      this.element.style.cssText = "position: absolute; z-index: 50; pointer-events: none; background-color: " + this.color;
    }
    var parentRect = parent == document.body && getComputedStyle(parent).position == "static"
        ? {left: -pageXOffset, top: -pageYOffset} : parent.getBoundingClientRect();
    this.element.style.left = (rect.left - parentRect.left) + "px";
    this.element.style.top = (rect.top - parentRect.top) + "px";
    this.element.style.width = (rect.right - rect.left) + "px";
    this.element.style.height = (rect.bottom - rect.top) + "px";
  };

  DropCursorView.prototype.scheduleRemoval = function scheduleRemoval (timeout) {
      var this$1 = this;

    clearTimeout(this.timeout);
    this.timeout = setTimeout(function () { return this$1.setCursor(null); }, timeout);
  };

  DropCursorView.prototype.dragover = function dragover (event) {
    var pos = this.editorView.posAtCoords({left: event.clientX, top: event.clientY});
    if (pos) {
      var target = pos.pos;
      if (this.editorView.dragging && this.editorView.dragging.slice) {
        target = prosemirrorTransform.dropPoint(this.editorView.state.doc, target, this.editorView.dragging.slice);
        if (target == null) { target = pos.pos; }
      }
      this.setCursor(target);
      this.scheduleRemoval(5000);
    }
  };

  DropCursorView.prototype.dragend = function dragend () {
    this.scheduleRemoval(20);
  };

  DropCursorView.prototype.drop = function drop () {
    this.scheduleRemoval(20);
  };

  DropCursorView.prototype.dragleave = function dragleave (event) {
    if (event.target == this.editorView.dom || !this.editorView.dom.contains(event.relatedTarget))
      { this.setCursor(null); }
  };

  exports.dropCursor = dropCursor;

  });

  var dropcursor$1 = unwrapExports(dropcursor);
  var dropcursor_1 = dropcursor.dropCursor;

  var dropcursor$2 = /*#__PURE__*/Object.freeze({
    'default': dropcursor$1,
    __moduleExports: dropcursor,
    dropCursor: dropcursor_1
  });

  var dist$7 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, '__esModule', { value: true });






  // ::- Gap cursor selections are represented using this class. Its
  // `$anchor` and `$head` properties both point at the cursor position.
  var GapCursor = (function (Selection$$1) {
    function GapCursor($pos) {
      Selection$$1.call(this, $pos, $pos);
    }

    if ( Selection$$1 ) GapCursor.__proto__ = Selection$$1;
    GapCursor.prototype = Object.create( Selection$$1 && Selection$$1.prototype );
    GapCursor.prototype.constructor = GapCursor;

    GapCursor.prototype.map = function map (doc, mapping) {
      var $pos = doc.resolve(mapping.map(this.head));
      return GapCursor.valid($pos) ? new GapCursor($pos) : Selection$$1.near($pos)
    };

    GapCursor.prototype.content = function content () { return dist.Slice.empty };

    GapCursor.prototype.eq = function eq (other) {
      return other instanceof GapCursor && other.head == this.head
    };

    GapCursor.prototype.toJSON = function toJSON () {
      return {type: "gapcursor", pos: this.head}
    };

    GapCursor.fromJSON = function fromJSON (doc, json) {
      if (typeof json.pos != "number") { throw new RangeError("Invalid input for GapCursor.fromJSON") }
      return new GapCursor(doc.resolve(json.pos))
    };

    GapCursor.prototype.getBookmark = function getBookmark () { return new GapBookmark(this.anchor) };

    GapCursor.valid = function valid ($pos) {
      var parent = $pos.parent;
      if (parent.isTextblock || !closedBefore($pos) || !closedAfter($pos)) { return false }
      var override = parent.type.spec.allowGapCursor;
      if (override != null) { return override }
      var deflt = parent.contentMatchAt($pos.index()).defaultType;
      return deflt && deflt.isTextblock
    };

    GapCursor.findFrom = function findFrom ($pos, dir, mustMove) {
      if (!mustMove && GapCursor.valid($pos)) { return $pos }

      var pos = $pos.pos, next = null;
      // Scan up from this position
      for (var d = $pos.depth;; d--) {
        var parent = $pos.node(d);
        if (dir > 0 ? $pos.indexAfter(d) < parent.childCount : $pos.index(d) > 0) {
          next = parent.maybeChild(dir > 0 ? $pos.indexAfter(d) : $pos.index(d) - 1);
          break
        } else if (d == 0) {
          return null
        }
        pos += dir;
        var $cur = $pos.doc.resolve(pos);
        if (GapCursor.valid($cur)) { return $cur }
      }

      // And then down into the next node
      for (;;) {
        next = dir > 0 ? next.firstChild : next.lastChild;
        if (!next) { break }
        pos += dir;
        var $cur$1 = $pos.doc.resolve(pos);
        if (GapCursor.valid($cur$1)) { return $cur$1 }
      }

      return null
    };

    return GapCursor;
  }(dist$3.Selection));

  GapCursor.prototype.visible = false;

  dist$3.Selection.jsonID("gapcursor", GapCursor);

  var GapBookmark = function GapBookmark(pos) {
    this.pos = pos;
  };
  GapBookmark.prototype.map = function map (mapping) {
    return new GapBookmark(mapping.map(this.pos))
  };
  GapBookmark.prototype.resolve = function resolve (doc) {
    var $pos = doc.resolve(this.pos);
    return GapCursor.valid($pos) ? new GapCursor($pos) : dist$3.Selection.near($pos)
  };

  function closedBefore($pos) {
    for (var d = $pos.depth; d >= 0; d--) {
      var index = $pos.index(d);
      // At the start of this parent, look at next one
      if (index == 0) { continue }
      // See if the node before (or its first ancestor) is closed
      for (var before = $pos.node(d).child(index - 1);; before = before.lastChild) {
        if ((before.childCount == 0 && !before.inlineContent) || before.isAtom || before.type.spec.isolating) { return true }
        if (before.inlineContent) { return false }
      }
    }
    // Hit start of document
    return true
  }

  function closedAfter($pos) {
    for (var d = $pos.depth; d >= 0; d--) {
      var index = $pos.indexAfter(d), parent = $pos.node(d);
      if (index == parent.childCount) { continue }
      for (var after = parent.child(index);; after = after.firstChild) {
        if ((after.childCount == 0 && !after.inlineContent) || after.isAtom || after.type.spec.isolating) { return true }
        if (after.inlineContent) { return false }
      }
    }
    return true
  }

  // :: () → Plugin
  // Create a gap cursor plugin. When enabled, this will capture clicks
  // near and arrow-key-motion past places that don't have a normally
  // selectable position nearby, and create a gap cursor selection for
  // them. The cursor is drawn as an element with class
  // `ProseMirror-gapcursor`. You can either include
  // `style/gapcursor.css` from the package's directory or add your own
  // styles to make it visible.
  var gapCursor = function() {
    return new dist$3.Plugin({
      props: {
        decorations: drawGapCursor,

        createSelectionBetween: function createSelectionBetween(_view, $anchor, $head) {
          if ($anchor.pos == $head.pos && GapCursor.valid($head)) { return new GapCursor($head) }
        },

        handleClick: handleClick,
        handleKeyDown: handleKeyDown
      }
    })
  };

  var handleKeyDown = keymap_1.keydownHandler({
    "ArrowLeft": arrow("horiz", -1),
    "ArrowRight": arrow("horiz", 1),
    "ArrowUp": arrow("vert", -1),
    "ArrowDown": arrow("vert", 1)
  });

  function arrow(axis, dir) {
    var dirStr = axis == "vert" ? (dir > 0 ? "down" : "up") : (dir > 0 ? "right" : "left");
    return function(state, dispatch, view) {
      var sel = state.selection;
      var $start = dir > 0 ? sel.$to : sel.$from, mustMove = sel.empty;
      if (sel instanceof dist$3.TextSelection) {
        if (!view.endOfTextblock(dirStr)) { return false }
        mustMove = false;
        $start = state.doc.resolve(dir > 0 ? $start.after() : $start.before());
      }
      var $found = GapCursor.findFrom($start, dir, mustMove);
      if (!$found) { return false }
      if (dispatch) { dispatch(state.tr.setSelection(new GapCursor($found))); }
      return true
    }
  }

  function handleClick(view, pos, event) {
    var $pos = view.state.doc.resolve(pos);
    if (!GapCursor.valid($pos)) { return false }
    var ref = view.posAtCoords({left: event.clientX, top: event.clientY});
    var inside = ref.inside;
    if (inside > -1 && dist$3.NodeSelection.isSelectable(view.state.doc.nodeAt(inside))) { return false }
    view.dispatch(view.state.tr.setSelection(new GapCursor($pos)));
    return true
  }

  function drawGapCursor(state) {
    if (!(state.selection instanceof GapCursor)) { return null }
    var node = document.createElement("div");
    node.className = "ProseMirror-gapcursor";
    return dist$4.DecorationSet.create(state.doc, [dist$4.Decoration.widget(state.selection.head, node, {key: "gapcursor"})])
  }

  exports.gapCursor = gapCursor;
  exports.GapCursor = GapCursor;

  });

  var index$1 = unwrapExports(dist$7);
  var dist_1$4 = dist$7.gapCursor;
  var dist_2$4 = dist$7.GapCursor;

  var dist$8 = /*#__PURE__*/Object.freeze({
    'default': index$1,
    __moduleExports: dist$7,
    gapCursor: dist_1$4,
    GapCursor: dist_2$4
  });

  var crel = createCommonjsModule(function (module, exports) {
  //Copyright (C) 2012 Kory Nunn

  //Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

  //The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

  //THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

  /*

      This code is not formatted for readability, but rather run-speed and to assist compilers.

      However, the code's intention should be transparent.

      *** IE SUPPORT ***

      If you require this library to work in IE7, add the following after declaring crel.

      var testDiv = document.createElement('div'),
          testLabel = document.createElement('label');

      testDiv.setAttribute('class', 'a');
      testDiv['className'] !== 'a' ? crel.attrMap['class'] = 'className':undefined;
      testDiv.setAttribute('name','a');
      testDiv['name'] !== 'a' ? crel.attrMap['name'] = function(element, value){
          element.id = value;
      }:undefined;


      testLabel.setAttribute('for', 'a');
      testLabel['htmlFor'] !== 'a' ? crel.attrMap['for'] = 'htmlFor':undefined;



  */

  (function (root, factory) {
      {
          module.exports = factory();
      }
  }(commonjsGlobal, function () {
      var fn = 'function',
          obj = 'object',
          nodeType = 'nodeType',
          textContent = 'textContent',
          setAttribute = 'setAttribute',
          attrMapString = 'attrMap',
          isNodeString = 'isNode',
          isElementString = 'isElement',
          d = typeof document === obj ? document : {},
          isType = function(a, type){
              return typeof a === type;
          },
          isNode = typeof Node === fn ? function (object) {
              return object instanceof Node;
          } :
          // in IE <= 8 Node is an object, obviously..
          function(object){
              return object &&
                  isType(object, obj) &&
                  (nodeType in object) &&
                  isType(object.ownerDocument,obj);
          },
          isElement = function (object) {
              return crel[isNodeString](object) && object[nodeType] === 1;
          },
          isArray = function(a){
              return a instanceof Array;
          },
          appendChild = function(element, child) {
              if (isArray(child)) {
                  child.map(function(subChild){
                      appendChild(element, subChild);
                  });
                  return;
              }
              if(!crel[isNodeString](child)){
                  child = d.createTextNode(child);
              }
              element.appendChild(child);
          };


      function crel(){
          var args = arguments, //Note: assigned to a variable to assist compilers. Saves about 40 bytes in closure compiler. Has negligable effect on performance.
              element = args[0],
              child,
              settings = args[1],
              childIndex = 2,
              argumentsLength = args.length,
              attributeMap = crel[attrMapString];

          element = crel[isElementString](element) ? element : d.createElement(element);
          // shortcut
          if(argumentsLength === 1){
              return element;
          }

          if(!isType(settings,obj) || crel[isNodeString](settings) || isArray(settings)) {
              --childIndex;
              settings = null;
          }

          // shortcut if there is only one child that is a string
          if((argumentsLength - childIndex) === 1 && isType(args[childIndex], 'string') && element[textContent] !== undefined){
              element[textContent] = args[childIndex];
          }else{
              for(; childIndex < argumentsLength; ++childIndex){
                  child = args[childIndex];

                  if(child == null){
                      continue;
                  }

                  if (isArray(child)) {
                    for (var i=0; i < child.length; ++i) {
                      appendChild(element, child[i]);
                    }
                  } else {
                    appendChild(element, child);
                  }
              }
          }

          for(var key in settings){
              if(!attributeMap[key]){
                  if(isType(settings[key],fn)){
                      element[key] = settings[key];
                  }else{
                      element[setAttribute](key, settings[key]);
                  }
              }else{
                  var attr = attributeMap[key];
                  if(typeof attr === fn){
                      attr(element, settings[key]);
                  }else{
                      element[setAttribute](attr, settings[key]);
                  }
              }
          }

          return element;
      }

      // Used for mapping one kind of attribute to the supported version of that in bad browsers.
      crel[attrMapString] = {};

      crel[isElementString] = isElement;

      crel[isNodeString] = isNode;

      if(typeof Proxy !== 'undefined'){
          crel.proxy = new Proxy(crel, {
              get: function(target, key){
                  !(key in crel) && (crel[key] = crel.bind(null, key));
                  return crel[key];
              }
          });
      }

      return crel;
  }));
  });

  var crel$1 = /*#__PURE__*/Object.freeze({
    'default': crel,
    __moduleExports: crel
  });

  var require$$0$3 = ( crel$1 && crel ) || crel$1;

  var prosemirrorCommands = ( commands$2 && commands$1 ) || commands$2;

  var prosemirrorHistory = ( history$1 && history ) || history$1;

  var dist$9 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, '__esModule', { value: true });

  function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

  var crel = _interopDefault(require$$0$3);




  var SVG = "http://www.w3.org/2000/svg";
  var XLINK = "http://www.w3.org/1999/xlink";

  var prefix$1 = "ProseMirror-icon";

  function hashPath(path) {
    var hash = 0;
    for (var i = 0; i < path.length; i++)
      { hash = (((hash << 5) - hash) + path.charCodeAt(i)) | 0; }
    return hash
  }

  function getIcon(icon) {
    var node = document.createElement("div");
    node.className = prefix$1;
    if (icon.path) {
      var name = "pm-icon-" + hashPath(icon.path).toString(16);
      if (!document.getElementById(name)) { buildSVG(name, icon); }
      var svg = node.appendChild(document.createElementNS(SVG, "svg"));
      svg.style.width = (icon.width / icon.height) + "em";
      var use = svg.appendChild(document.createElementNS(SVG, "use"));
      use.setAttributeNS(XLINK, "href", /([^#]*)/.exec(document.location)[1] + "#" + name);
    } else if (icon.dom) {
      node.appendChild(icon.dom.cloneNode(true));
    } else {
      node.appendChild(document.createElement("span")).textContent = icon.text || '';
      if (icon.css) { node.firstChild.style.cssText = icon.css; }
    }
    return node
  }

  function buildSVG(name, data) {
    var collection = document.getElementById(prefix$1 + "-collection");
    if (!collection) {
      collection = document.createElementNS(SVG, "svg");
      collection.id = prefix$1 + "-collection";
      collection.style.display = "none";
      document.body.insertBefore(collection, document.body.firstChild);
    }
    var sym = document.createElementNS(SVG, "symbol");
    sym.id = name;
    sym.setAttribute("viewBox", "0 0 " + data.width + " " + data.height);
    var path = sym.appendChild(document.createElementNS(SVG, "path"));
    path.setAttribute("d", data.path);
    collection.appendChild(sym);
  }

  var prefix = "ProseMirror-menu";

  // ::- An icon or label that, when clicked, executes a command.
  var MenuItem = function MenuItem(spec) {
    // :: MenuItemSpec
    // The spec used to create the menu item.
    this.spec = spec;
  };

  // :: (EditorView) → {dom: dom.Node, update: (EditorState) → bool}
  // Renders the icon according to its [display
  // spec](#menu.MenuItemSpec.display), and adds an event handler which
  // executes the command when the representation is clicked.
  MenuItem.prototype.render = function render (view) {
    var spec = this.spec;
    var dom = spec.render ? spec.render(view)
        : spec.icon ? getIcon(spec.icon)
        : spec.label ? crel("div", null, translate(view, spec.label))
        : null;
    if (!dom) { throw new RangeError("MenuItem without icon or label property") }
    if (spec.title) {
      var title = (typeof spec.title === "function" ? spec.title(view.state) : spec.title);
      dom.setAttribute("title", translate(view, title));
    }
    if (spec.class) { dom.classList.add(spec.class); }
    if (spec.css) { dom.style.cssText += spec.css; }

    dom.addEventListener("mousedown", function (e) {
      e.preventDefault();
      if (!dom.classList.contains(prefix + "-disabled"))
        { spec.run(view.state, view.dispatch, view, e); }
    });

    function update(state) {
      if (spec.select) {
        var selected = spec.select(state);
        dom.style.display = selected ? "" : "none";
        if (!selected) { return false }
      }
      var enabled = true;
      if (spec.enable) {
        enabled = spec.enable(state) || false;
        setClass(dom, prefix + "-disabled", !enabled);
      }
      if (spec.active) {
        var active = enabled && spec.active(state) || false;
        setClass(dom, prefix + "-active", active);
      }
      return true
    }

    return {dom: dom, update: update}
  };

  function translate(view, text) {
    return view._props.translate ? view._props.translate(text) : text
  }

  // MenuItemSpec:: interface
  // The configuration object passed to the `MenuItem` constructor.
  //
  //   run:: (EditorState, (Transaction), EditorView, dom.Event)
  //   The function to execute when the menu item is activated.
  //
  //   select:: ?(EditorState) → bool
  //   Optional function that is used to determine whether the item is
  //   appropriate at the moment. Deselected items will be hidden.
  //
  //   enable:: ?(EditorState) → bool
  //   Function that is used to determine if the item is enabled. If
  //   given and returning false, the item will be given a disabled
  //   styling.
  //
  //   active:: ?(EditorState) → bool
  //   A predicate function to determine whether the item is 'active' (for
  //   example, the item for toggling the strong mark might be active then
  //   the cursor is in strong text).
  //
  //   render:: ?(EditorView) → dom.Node
  //   A function that renders the item. You must provide either this,
  //   [`icon`](#menu.MenuItemSpec.icon), or [`label`](#MenuItemSpec.label).
  //
  //   icon:: ?Object
  //   Describes an icon to show for this item. The object may specify
  //   an SVG icon, in which case its `path` property should be an [SVG
  //   path
  //   spec](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d),
  //   and `width` and `height` should provide the viewbox in which that
  //   path exists. Alternatively, it may have a `text` property
  //   specifying a string of text that makes up the icon, with an
  //   optional `css` property giving additional CSS styling for the
  //   text. _Or_ it may contain `dom` property containing a DOM node.
  //
  //   label:: ?string
  //   Makes the item show up as a text label. Mostly useful for items
  //   wrapped in a [drop-down](#menu.Dropdown) or similar menu. The object
  //   should have a `label` property providing the text to display.
  //
  //   title:: ?union<string, (EditorState) → string>
  //   Defines DOM title (mouseover) text for the item.
  //
  //   class:: ?string
  //   Optionally adds a CSS class to the item's DOM representation.
  //
  //   css:: ?string
  //   Optionally adds a string of inline CSS to the item's DOM
  //   representation.
  //
  //   execEvent:: ?string
  //   Defines which event on the command's DOM representation should
  //   trigger the execution of the command. Defaults to mousedown.

  var lastMenuEvent = {time: 0, node: null};
  function markMenuEvent(e) {
    lastMenuEvent.time = Date.now();
    lastMenuEvent.node = e.target;
  }
  function isMenuEvent(wrapper) {
    return Date.now() - 100 < lastMenuEvent.time &&
      lastMenuEvent.node && wrapper.contains(lastMenuEvent.node)
  }

  // ::- A drop-down menu, displayed as a label with a downwards-pointing
  // triangle to the right of it.
  var Dropdown = function Dropdown(content, options) {
    this.options = options || {};
    this.content = Array.isArray(content) ? content : [content];
  };

  // :: (EditorView) → {dom: dom.Node, update: (EditorState)}
  // Render the dropdown menu and sub-items.
  Dropdown.prototype.render = function render (view) {
      var this$1 = this;

    var content = renderDropdownItems(this.content, view);

    var label = crel("div", {class: prefix + "-dropdown " + (this.options.class || ""),
                             style: this.options.css},
                     translate(view, this.options.label));
    if (this.options.title) { label.setAttribute("title", translate(view, this.options.title)); }
    var wrap = crel("div", {class: prefix + "-dropdown-wrap"}, label);
    var open = null, listeningOnClose = null;
    var close = function () {
      if (open && open.close()) {
        open = null;
        window.removeEventListener("mousedown", listeningOnClose);
      }
    };
    label.addEventListener("mousedown", function (e) {
      e.preventDefault();
      markMenuEvent(e);
      if (open) {
        close();
      } else {
        open = this$1.expand(wrap, content.dom);
        window.addEventListener("mousedown", listeningOnClose = function () {
          if (!isMenuEvent(wrap)) { close(); }
        });
      }
    });

    function update(state) {
      var inner = content.update(state);
      wrap.style.display = inner ? "" : "none";
      return inner
    }

    return {dom: wrap, update: update}
  };

  Dropdown.prototype.expand = function expand (dom, items) {
    var menuDOM = crel("div", {class: prefix + "-dropdown-menu " + (this.options.class || "")}, items);

    var done = false;
    function close() {
      if (done) { return }
      done = true;
      dom.removeChild(menuDOM);
      return true
    }
    dom.appendChild(menuDOM);
    return {close: close, node: menuDOM}
  };

  function renderDropdownItems(items, view) {
    var rendered = [], updates = [];
    for (var i = 0; i < items.length; i++) {
      var ref = items[i].render(view);
      var dom = ref.dom;
      var update = ref.update;
      rendered.push(crel("div", {class: prefix + "-dropdown-item"}, dom));
      updates.push(update);
    }
    return {dom: rendered, update: combineUpdates(updates, rendered)}
  }

  function combineUpdates(updates, nodes) {
    return function (state) {
      var something = false;
      for (var i = 0; i < updates.length; i++) {
        var up = updates[i](state);
        nodes[i].style.display = up ? "" : "none";
        if (up) { something = true; }
      }
      return something
    }
  }

  // ::- Represents a submenu wrapping a group of elements that start
  // hidden and expand to the right when hovered over or tapped.
  var DropdownSubmenu = function DropdownSubmenu(content, options) {
    this.options = options || {};
    this.content = Array.isArray(content) ? content : [content];
  };

  // :: (EditorView) → {dom: dom.Node, update: (EditorState) → bool}
  // Renders the submenu.
  DropdownSubmenu.prototype.render = function render (view) {
    var items = renderDropdownItems(this.content, view);

    var label = crel("div", {class: prefix + "-submenu-label"}, translate(view, this.options.label));
    var wrap = crel("div", {class: prefix + "-submenu-wrap"}, label,
                   crel("div", {class: prefix + "-submenu"}, items.dom));
    var listeningOnClose = null;
    label.addEventListener("mousedown", function (e) {
      e.preventDefault();
      markMenuEvent(e);
      setClass(wrap, prefix + "-submenu-wrap-active");
      if (!listeningOnClose)
        { window.addEventListener("mousedown", listeningOnClose = function () {
          if (!isMenuEvent(wrap)) {
            wrap.classList.remove(prefix + "-submenu-wrap-active");
            window.removeEventListener("mousedown", listeningOnClose);
            listeningOnClose = null;
          }
        }); }
    });

    function update(state) {
      var inner = items.update(state);
      wrap.style.display = inner ? "" : "none";
      return inner
    }
    return {dom: wrap, update: update}
  };

  // :: (EditorView, [union<MenuElement, [MenuElement]>]) → {dom: ?dom.DocumentFragment, update: (EditorState) → bool}
  // Render the given, possibly nested, array of menu elements into a
  // document fragment, placing separators between them (and ensuring no
  // superfluous separators appear when some of the groups turn out to
  // be empty).
  function renderGrouped(view, content) {
    var result = document.createDocumentFragment();
    var updates = [], separators = [];
    for (var i = 0; i < content.length; i++) {
      var items = content[i], localUpdates = [], localNodes = [];
      for (var j = 0; j < items.length; j++) {
        var ref = items[j].render(view);
        var dom = ref.dom;
        var update$1 = ref.update;
        var span = crel("span", {class: prefix + "item"}, dom);
        result.appendChild(span);
        localNodes.push(span);
        localUpdates.push(update$1);
      }
      if (localUpdates.length) {
        updates.push(combineUpdates(localUpdates, localNodes));
        if (i < content.length - 1)
          { separators.push(result.appendChild(separator())); }
      }
    }

    function update(state) {
      var something = false, needSep = false;
      for (var i = 0; i < updates.length; i++) {
        var hasContent = updates[i](state);
        if (i) { separators[i - 1].style.display = needSep && hasContent ? "" : "none"; }
        needSep = hasContent;
        if (hasContent) { something = true; }
      }
      return something
    }
    return {dom: result, update: update}
  }

  function separator() {
    return crel("span", {class: prefix + "separator"})
  }

  // :: Object
  // A set of basic editor-related icons. Contains the properties
  // `join`, `lift`, `selectParentNode`, `undo`, `redo`, `strong`, `em`,
  // `code`, `link`, `bulletList`, `orderedList`, and `blockquote`, each
  // holding an object that can be used as the `icon` option to
  // `MenuItem`.
  var icons = {
    join: {
      width: 800, height: 900,
      path: "M0 75h800v125h-800z M0 825h800v-125h-800z M250 400h100v-100h100v100h100v100h-100v100h-100v-100h-100z"
    },
    lift: {
      width: 1024, height: 1024,
      path: "M219 310v329q0 7-5 12t-12 5q-8 0-13-5l-164-164q-5-5-5-13t5-13l164-164q5-5 13-5 7 0 12 5t5 12zM1024 749v109q0 7-5 12t-12 5h-987q-7 0-12-5t-5-12v-109q0-7 5-12t12-5h987q7 0 12 5t5 12zM1024 530v109q0 7-5 12t-12 5h-621q-7 0-12-5t-5-12v-109q0-7 5-12t12-5h621q7 0 12 5t5 12zM1024 310v109q0 7-5 12t-12 5h-621q-7 0-12-5t-5-12v-109q0-7 5-12t12-5h621q7 0 12 5t5 12zM1024 91v109q0 7-5 12t-12 5h-987q-7 0-12-5t-5-12v-109q0-7 5-12t12-5h987q7 0 12 5t5 12z"
    },
    selectParentNode: {text: "\u2b1a", css: "font-weight: bold"},
    undo: {
      width: 1024, height: 1024,
      path: "M761 1024c113-206 132-520-313-509v253l-384-384 384-384v248c534-13 594 472 313 775z"
    },
    redo: {
      width: 1024, height: 1024,
      path: "M576 248v-248l384 384-384 384v-253c-446-10-427 303-313 509-280-303-221-789 313-775z"
    },
    strong: {
      width: 805, height: 1024,
      path: "M317 869q42 18 80 18 214 0 214-191 0-65-23-102-15-25-35-42t-38-26-46-14-48-6-54-1q-41 0-57 5 0 30-0 90t-0 90q0 4-0 38t-0 55 2 47 6 38zM309 442q24 4 62 4 46 0 81-7t62-25 42-51 14-81q0-40-16-70t-45-46-61-24-70-8q-28 0-74 7 0 28 2 86t2 86q0 15-0 45t-0 45q0 26 0 39zM0 950l1-53q8-2 48-9t60-15q4-6 7-15t4-19 3-18 1-21 0-19v-37q0-561-12-585-2-4-12-8t-25-6-28-4-27-2-17-1l-2-47q56-1 194-6t213-5q13 0 39 0t38 0q40 0 78 7t73 24 61 40 42 59 16 78q0 29-9 54t-22 41-36 32-41 25-48 22q88 20 146 76t58 141q0 57-20 102t-53 74-78 48-93 27-100 8q-25 0-75-1t-75-1q-60 0-175 6t-132 6z"
    },
    em: {
      width: 585, height: 1024,
      path: "M0 949l9-48q3-1 46-12t63-21q16-20 23-57 0-4 35-165t65-310 29-169v-14q-13-7-31-10t-39-4-33-3l10-58q18 1 68 3t85 4 68 1q27 0 56-1t69-4 56-3q-2 22-10 50-17 5-58 16t-62 19q-4 10-8 24t-5 22-4 26-3 24q-15 84-50 239t-44 203q-1 5-7 33t-11 51-9 47-3 32l0 10q9 2 105 17-1 25-9 56-6 0-18 0t-18 0q-16 0-49-5t-49-5q-78-1-117-1-29 0-81 5t-69 6z"
    },
    code: {
      width: 896, height: 1024,
      path: "M608 192l-96 96 224 224-224 224 96 96 288-320-288-320zM288 192l-288 320 288 320 96-96-224-224 224-224-96-96z"
    },
    link: {
      width: 951, height: 1024,
      path: "M832 694q0-22-16-38l-118-118q-16-16-38-16-24 0-41 18 1 1 10 10t12 12 8 10 7 14 2 15q0 22-16 38t-38 16q-8 0-15-2t-14-7-10-8-12-12-10-10q-18 17-18 41 0 22 16 38l117 118q15 15 38 15 22 0 38-14l84-83q16-16 16-38zM430 292q0-22-16-38l-117-118q-16-16-38-16-22 0-38 15l-84 83q-16 16-16 38 0 22 16 38l118 118q15 15 38 15 24 0 41-17-1-1-10-10t-12-12-8-10-7-14-2-15q0-22 16-38t38-16q8 0 15 2t14 7 10 8 12 12 10 10q18-17 18-41zM941 694q0 68-48 116l-84 83q-47 47-116 47-69 0-116-48l-117-118q-47-47-47-116 0-70 50-119l-50-50q-49 50-118 50-68 0-116-48l-118-118q-48-48-48-116t48-116l84-83q47-47 116-47 69 0 116 48l117 118q47 47 47 116 0 70-50 119l50 50q49-50 118-50 68 0 116 48l118 118q48 48 48 116z"
    },
    bulletList: {
      width: 768, height: 896,
      path: "M0 512h128v-128h-128v128zM0 256h128v-128h-128v128zM0 768h128v-128h-128v128zM256 512h512v-128h-512v128zM256 256h512v-128h-512v128zM256 768h512v-128h-512v128z"
    },
    orderedList: {
      width: 768, height: 896,
      path: "M320 512h448v-128h-448v128zM320 768h448v-128h-448v128zM320 128v128h448v-128h-448zM79 384h78v-256h-36l-85 23v50l43-2v185zM189 590c0-36-12-78-96-78-33 0-64 6-83 16l1 66c21-10 42-15 67-15s32 11 32 28c0 26-30 58-110 112v50h192v-67l-91 2c49-30 87-66 87-113l1-1z"
    },
    blockquote: {
      width: 640, height: 896,
      path: "M0 448v256h256v-256h-128c0 0 0-128 128-128v-128c0 0-256 0-256 256zM640 320v-128c0 0-256 0-256 256v256h256v-256h-128c0 0 0-128 128-128z"
    }
  };

  // :: MenuItem
  // Menu item for the `joinUp` command.
  var joinUpItem = new MenuItem({
    title: "Join with above block",
    run: prosemirrorCommands.joinUp,
    select: function (state) { return prosemirrorCommands.joinUp(state); },
    icon: icons.join
  });

  // :: MenuItem
  // Menu item for the `lift` command.
  var liftItem = new MenuItem({
    title: "Lift out of enclosing block",
    run: prosemirrorCommands.lift,
    select: function (state) { return prosemirrorCommands.lift(state); },
    icon: icons.lift
  });

  // :: MenuItem
  // Menu item for the `selectParentNode` command.
  var selectParentNodeItem = new MenuItem({
    title: "Select parent node",
    run: prosemirrorCommands.selectParentNode,
    select: function (state) { return prosemirrorCommands.selectParentNode(state); },
    icon: icons.selectParentNode
  });

  // :: MenuItem
  // Menu item for the `undo` command.
  var undoItem = new MenuItem({
    title: "Undo last change",
    run: prosemirrorHistory.undo,
    enable: function (state) { return prosemirrorHistory.undo(state); },
    icon: icons.undo
  });

  // :: MenuItem
  // Menu item for the `redo` command.
  var redoItem = new MenuItem({
    title: "Redo last undone change",
    run: prosemirrorHistory.redo,
    enable: function (state) { return prosemirrorHistory.redo(state); },
    icon: icons.redo
  });

  // :: (NodeType, Object) → MenuItem
  // Build a menu item for wrapping the selection in a given node type.
  // Adds `run` and `select` properties to the ones present in
  // `options`. `options.attrs` may be an object or a function.
  function wrapItem(nodeType, options) {
    var passedOptions = {
      run: function run(state, dispatch) {
        // FIXME if (options.attrs instanceof Function) options.attrs(state, attrs => wrapIn(nodeType, attrs)(state))
        return prosemirrorCommands.wrapIn(nodeType, options.attrs)(state, dispatch)
      },
      select: function select(state) {
        return prosemirrorCommands.wrapIn(nodeType, options.attrs instanceof Function ? null : options.attrs)(state)
      }
    };
    for (var prop in options) { passedOptions[prop] = options[prop]; }
    return new MenuItem(passedOptions)
  }

  // :: (NodeType, Object) → MenuItem
  // Build a menu item for changing the type of the textblock around the
  // selection to the given type. Provides `run`, `active`, and `select`
  // properties. Others must be given in `options`. `options.attrs` may
  // be an object to provide the attributes for the textblock node.
  function blockTypeItem(nodeType, options) {
    var command = prosemirrorCommands.setBlockType(nodeType, options.attrs);
    var passedOptions = {
      run: command,
      enable: function enable(state) { return command(state) },
      active: function active(state) {
        var ref = state.selection;
        var $from = ref.$from;
        var to = ref.to;
        var node = ref.node;
        if (node) { return node.hasMarkup(nodeType, options.attrs) }
        return to <= $from.end() && $from.parent.hasMarkup(nodeType, options.attrs)
      }
    };
    for (var prop in options) { passedOptions[prop] = options[prop]; }
    return new MenuItem(passedOptions)
  }

  // Work around classList.toggle being broken in IE11
  function setClass(dom, cls, on) {
    if (on) { dom.classList.add(cls); }
    else { dom.classList.remove(cls); }
  }

  var prefix$2 = "ProseMirror-menubar";

  function isIOS() {
    if (typeof navigator == "undefined") { return false }
    var agent = navigator.userAgent;
    return !/Edge\/\d/.test(agent) && /AppleWebKit/.test(agent) && /Mobile\/\w+/.test(agent)
  }

  // :: (Object) → Plugin
  // A plugin that will place a menu bar above the editor. Note that
  // this involves wrapping the editor in an additional `<div>`.
  //
  //   options::-
  //   Supports the following options:
  //
  //     content:: [[MenuElement]]
  //     Provides the content of the menu, as a nested array to be
  //     passed to `renderGrouped`.
  //
  //     floating:: ?bool
  //     Determines whether the menu floats, i.e. whether it sticks to
  //     the top of the viewport when the editor is partially scrolled
  //     out of view.
  function menuBar(options) {
    return new dist$3.Plugin({
      view: function view(editorView) { return new MenuBarView(editorView, options) }
    })
  }

  var MenuBarView = function MenuBarView(editorView, options) {
    var this$1 = this;

    this.editorView = editorView;
    this.options = options;

    this.wrapper = crel("div", {class: prefix$2 + "-wrapper"});
    this.menu = this.wrapper.appendChild(crel("div", {class: prefix$2}));
    this.menu.className = prefix$2;
    this.spacer = null;

    editorView.dom.parentNode.replaceChild(this.wrapper, editorView.dom);
    this.wrapper.appendChild(editorView.dom);

    this.maxHeight = 0;
    this.widthForMaxHeight = 0;
    this.floating = false;

    var ref = renderGrouped(this.editorView, this.options.content);
    var dom = ref.dom;
    var update = ref.update;
    this.contentUpdate = update;
    this.menu.appendChild(dom);
    this.update();

    if (options.floating && !isIOS()) {
      this.updateFloat();
      var potentialScrollers = getAllWrapping(this.wrapper);
      this.scrollFunc = function (e) {
        var root = this$1.editorView.root;
        if (!(root.body || root).contains(this$1.wrapper)) {
            potentialScrollers.forEach(function (el) { return el.removeEventListener("scroll", this$1.scrollFunc); });
        } else {
            this$1.updateFloat(e.target.getBoundingClientRect && e.target);
        }
      };
      potentialScrollers.forEach(function (el) { return el.addEventListener('scroll', this$1.scrollFunc); });
    }
  };

  MenuBarView.prototype.update = function update () {
    this.contentUpdate(this.editorView.state);

    if (this.floating) {
      this.updateScrollCursor();
    } else {
      if (this.menu.offsetWidth != this.widthForMaxHeight) {
        this.widthForMaxHeight = this.menu.offsetWidth;
        this.maxHeight = 0;
      }
      if (this.menu.offsetHeight > this.maxHeight) {
        this.maxHeight = this.menu.offsetHeight;
        this.menu.style.minHeight = this.maxHeight + "px";
      }
    }
  };

  MenuBarView.prototype.updateScrollCursor = function updateScrollCursor () {
    var selection = this.editorView.root.getSelection();
    if (!selection.focusNode) { return }
    var rects = selection.getRangeAt(0).getClientRects();
    var selRect = rects[selectionIsInverted(selection) ? 0 : rects.length - 1];
    if (!selRect) { return }
    var menuRect = this.menu.getBoundingClientRect();
    if (selRect.top < menuRect.bottom && selRect.bottom > menuRect.top) {
      var scrollable = findWrappingScrollable(this.wrapper);
      if (scrollable) { scrollable.scrollTop -= (menuRect.bottom - selRect.top); }
    }
  };

  MenuBarView.prototype.updateFloat = function updateFloat (scrollAncestor) {
    var parent = this.wrapper, editorRect = parent.getBoundingClientRect(),
        top = scrollAncestor ? Math.max(0, scrollAncestor.getBoundingClientRect().top) : 0;

    if (this.floating) {
      if (editorRect.top >= top || editorRect.bottom < this.menu.offsetHeight + 10) {
        this.floating = false;
        this.menu.style.position = this.menu.style.left = this.menu.style.top = this.menu.style.width = "";
        this.menu.style.display = "";
        this.spacer.parentNode.removeChild(this.spacer);
        this.spacer = null;
      } else {
        var border = (parent.offsetWidth - parent.clientWidth) / 2;
        this.menu.style.left = (editorRect.left + border) + "px";
        this.menu.style.display = (editorRect.top > window.innerHeight ? "none" : "");
        if (scrollAncestor) { this.menu.style.top = top + "px"; }
      }
    } else {
      if (editorRect.top < top && editorRect.bottom >= this.menu.offsetHeight + 10) {
        this.floating = true;
        var menuRect = this.menu.getBoundingClientRect();
        this.menu.style.left = menuRect.left + "px";
        this.menu.style.width = menuRect.width + "px";
        if (scrollAncestor) { this.menu.style.top = top + "px"; }
        this.menu.style.position = "fixed";
        this.spacer = crel("div", {class: prefix$2 + "-spacer", style: ("height: " + (menuRect.height) + "px")});
        parent.insertBefore(this.spacer, this.menu);
      }
    }
  };

  MenuBarView.prototype.destroy = function destroy () {
    if (this.wrapper.parentNode)
      { this.wrapper.parentNode.replaceChild(this.editorView.dom, this.wrapper); }
  };

  // Not precise, but close enough
  function selectionIsInverted(selection) {
    if (selection.anchorNode == selection.focusNode) { return selection.anchorOffset > selection.focusOffset }
    return selection.anchorNode.compareDocumentPosition(selection.focusNode) == Node.DOCUMENT_POSITION_FOLLOWING
  }

  function findWrappingScrollable(node) {
    for (var cur = node.parentNode; cur; cur = cur.parentNode)
      { if (cur.scrollHeight > cur.clientHeight) { return cur } }
  }

  function getAllWrapping(node) {
      var res = [window];
      for (var cur = node.parentNode; cur; cur = cur.parentNode)
          { res.push(cur); }
      return res
  }

  // !! This module defines a number of building blocks for ProseMirror
  // menus, along with a [menu bar](#menu.menuBar) implementation.

  // MenuElement:: interface
  // The types defined in this module aren't the only thing you can
  // display in your menu. Anything that conforms to this interface can
  // be put into a menu structure.
  //
  //   render:: (pm: EditorView) → {dom: dom.Node, update: (EditorState) → bool}
  //   Render the element for display in the menu. Must return a DOM
  //   element and a function that can be used to update the element to
  //   a new state. The `update` function will return false if the
  //   update hid the entire element.

  exports.MenuItem = MenuItem;
  exports.Dropdown = Dropdown;
  exports.DropdownSubmenu = DropdownSubmenu;
  exports.renderGrouped = renderGrouped;
  exports.icons = icons;
  exports.joinUpItem = joinUpItem;
  exports.liftItem = liftItem;
  exports.selectParentNodeItem = selectParentNodeItem;
  exports.undoItem = undoItem;
  exports.redoItem = redoItem;
  exports.wrapItem = wrapItem;
  exports.blockTypeItem = blockTypeItem;
  exports.menuBar = menuBar;

  });

  var index$2 = unwrapExports(dist$9);
  var dist_1$5 = dist$9.MenuItem;
  var dist_2$5 = dist$9.Dropdown;
  var dist_3$4 = dist$9.DropdownSubmenu;
  var dist_4$4 = dist$9.renderGrouped;
  var dist_5$4 = dist$9.icons;
  var dist_6$4 = dist$9.joinUpItem;
  var dist_7$3 = dist$9.liftItem;
  var dist_8$3 = dist$9.selectParentNodeItem;
  var dist_9$3 = dist$9.undoItem;
  var dist_10$2 = dist$9.redoItem;
  var dist_11$2 = dist$9.wrapItem;
  var dist_12$2 = dist$9.blockTypeItem;
  var dist_13$2 = dist$9.menuBar;

  var dist$a = /*#__PURE__*/Object.freeze({
    'default': index$2,
    __moduleExports: dist$9,
    MenuItem: dist_1$5,
    Dropdown: dist_2$5,
    DropdownSubmenu: dist_3$4,
    renderGrouped: dist_4$4,
    icons: dist_5$4,
    joinUpItem: dist_6$4,
    liftItem: dist_7$3,
    selectParentNodeItem: dist_8$3,
    undoItem: dist_9$3,
    redoItem: dist_10$2,
    wrapItem: dist_11$2,
    blockTypeItem: dist_12$2,
    menuBar: dist_13$2
  });

  var schemaList = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, '__esModule', { value: true });




  var olDOM = ["ol", 0];
  var ulDOM = ["ul", 0];
  var liDOM = ["li", 0];

  // :: NodeSpec
  // An ordered list [node spec](#model.NodeSpec). Has a single
  // attribute, `order`, which determines the number at which the list
  // starts counting, and defaults to 1. Represented as an `<ol>`
  // element.
  var orderedList = {
    attrs: {order: {default: 1}},
    parseDOM: [{tag: "ol", getAttrs: function getAttrs(dom) {
      return {order: dom.hasAttribute("start") ? +dom.getAttribute("start") : 1}
    }}],
    toDOM: function toDOM(node) {
      return node.attrs.order == 1 ? olDOM : ["ol", {start: node.attrs.order}, 0]
    }
  };

  // :: NodeSpec
  // A bullet list node spec, represented in the DOM as `<ul>`.
  var bulletList = {
    parseDOM: [{tag: "ul"}],
    toDOM: function toDOM() { return ulDOM }
  };

  // :: NodeSpec
  // A list item (`<li>`) spec.
  var listItem = {
    parseDOM: [{tag: "li"}],
    toDOM: function toDOM() { return liDOM },
    defining: true
  };

  function add(obj, props) {
    var copy = {};
    for (var prop in obj) { copy[prop] = obj[prop]; }
    for (var prop$1 in props) { copy[prop$1] = props[prop$1]; }
    return copy
  }

  // :: (OrderedMap<NodeSpec>, string, ?string) → OrderedMap<NodeSpec>
  // Convenience function for adding list-related node types to a map
  // specifying the nodes for a schema. Adds
  // [`orderedList`](#schema-list.orderedList) as `"ordered_list"`,
  // [`bulletList`](#schema-list.bulletList) as `"bullet_list"`, and
  // [`listItem`](#schema-list.listItem) as `"list_item"`.
  //
  // `itemContent` determines the content expression for the list items.
  // If you want the commands defined in this module to apply to your
  // list structure, it should have a shape like `"paragraph block*"` or
  // `"paragraph (ordered_list | bullet_list)*"`. `listGroup` can be
  // given to assign a group name to the list node types, for example
  // `"block"`.
  function addListNodes(nodes, itemContent, listGroup) {
    return nodes.append({
      ordered_list: add(orderedList, {content: "list_item+", group: listGroup}),
      bullet_list: add(bulletList, {content: "list_item+", group: listGroup}),
      list_item: add(listItem, {content: itemContent})
    })
  }

  // :: (NodeType, ?Object) → (state: EditorState, dispatch: ?(tr: Transaction)) → bool
  // Returns a command function that wraps the selection in a list with
  // the given type an attributes. If `dispatch` is null, only return a
  // value to indicate whether this is possible, but don't actually
  // perform the change.
  function wrapInList(listType, attrs) {
    return function(state, dispatch) {
      var ref = state.selection;
      var $from = ref.$from;
      var $to = ref.$to;
      var range = $from.blockRange($to), doJoin = false, outerRange = range;
      if (!range) { return false }
      // This is at the top of an existing list item
      if (range.depth >= 2 && $from.node(range.depth - 1).type.compatibleContent(listType) && range.startIndex == 0) {
        // Don't do anything if this is the top of the list
        if ($from.index(range.depth - 1) == 0) { return false }
        var $insert = state.doc.resolve(range.start - 2);
        outerRange = new dist.NodeRange($insert, $insert, range.depth);
        if (range.endIndex < range.parent.childCount)
          { range = new dist.NodeRange($from, state.doc.resolve($to.end(range.depth)), range.depth); }
        doJoin = true;
      }
      var wrap = prosemirrorTransform.findWrapping(outerRange, listType, attrs, range);
      if (!wrap) { return false }
      if (dispatch) { dispatch(doWrapInList(state.tr, range, wrap, doJoin, listType).scrollIntoView()); }
      return true
    }
  }

  function doWrapInList(tr, range, wrappers, joinBefore, listType) {
    var content = dist.Fragment.empty;
    for (var i = wrappers.length - 1; i >= 0; i--)
      { content = dist.Fragment.from(wrappers[i].type.create(wrappers[i].attrs, content)); }

    tr.step(new prosemirrorTransform.ReplaceAroundStep(range.start - (joinBefore ? 2 : 0), range.end, range.start, range.end,
                                  new dist.Slice(content, 0, 0), wrappers.length, true));

    var found = 0;
    for (var i$1 = 0; i$1 < wrappers.length; i$1++) { if (wrappers[i$1].type == listType) { found = i$1 + 1; } }
    var splitDepth = wrappers.length - found;

    var splitPos = range.start + wrappers.length - (joinBefore ? 2 : 0), parent = range.parent;
    for (var i$2 = range.startIndex, e = range.endIndex, first = true; i$2 < e; i$2++, first = false) {
      if (!first && prosemirrorTransform.canSplit(tr.doc, splitPos, splitDepth)) {
        tr.split(splitPos, splitDepth);
        splitPos += 2 * splitDepth;
      }
      splitPos += parent.child(i$2).nodeSize;
    }
    return tr
  }

  // :: (NodeType) → (state: EditorState, dispatch: ?(tr: Transaction)) → bool
  // Build a command that splits a non-empty textblock at the top level
  // of a list item by also splitting that list item.
  function splitListItem(itemType) {
    return function(state, dispatch) {
      var ref = state.selection;
      var $from = ref.$from;
      var $to = ref.$to;
      var node = ref.node;
      if ((node && node.isBlock) || $from.depth < 2 || !$from.sameParent($to)) { return false }
      var grandParent = $from.node(-1);
      if (grandParent.type != itemType) { return false }
      if ($from.parent.content.size == 0) {
        // In an empty block. If this is a nested list, the wrapping
        // list item should be split. Otherwise, bail out and let next
        // command handle lifting.
        if ($from.depth == 2 || $from.node(-3).type != itemType ||
            $from.index(-2) != $from.node(-2).childCount - 1) { return false }
        if (dispatch) {
          var wrap = dist.Fragment.empty, keepItem = $from.index(-1) > 0;
          // Build a fragment containing empty versions of the structure
          // from the outer list item to the parent node of the cursor
          for (var d = $from.depth - (keepItem ? 1 : 2); d >= $from.depth - 3; d--)
            { wrap = dist.Fragment.from($from.node(d).copy(wrap)); }
          // Add a second list item with an empty default start node
          wrap = wrap.append(dist.Fragment.from(itemType.createAndFill()));
          var tr$1 = state.tr.replace($from.before(keepItem ? null : -1), $from.after(-3), new dist.Slice(wrap, keepItem ? 3 : 2, 2));
          tr$1.setSelection(state.selection.constructor.near(tr$1.doc.resolve($from.pos + (keepItem ? 3 : 2))));
          dispatch(tr$1.scrollIntoView());
        }
        return true
      }
      var nextType = $to.pos == $from.end() ? grandParent.contentMatchAt($from.indexAfter(-1)).defaultType : null;
      var tr = state.tr.delete($from.pos, $to.pos);
      var types = nextType && [null, {type: nextType}];
      if (!prosemirrorTransform.canSplit(tr.doc, $from.pos, 2, types)) { return false }
      if (dispatch) { dispatch(tr.split($from.pos, 2, types).scrollIntoView()); }
      return true
    }
  }

  // :: (NodeType) → (state: EditorState, dispatch: ?(tr: Transaction)) → bool
  // Create a command to lift the list item around the selection up into
  // a wrapping list.
  function liftListItem(itemType) {
    return function(state, dispatch) {
      var ref = state.selection;
      var $from = ref.$from;
      var $to = ref.$to;
      var range = $from.blockRange($to, function (node) { return node.childCount && node.firstChild.type == itemType; });
      if (!range) { return false }
      if (!dispatch) { return true }
      if ($from.node(range.depth - 1).type == itemType) // Inside a parent list
        { return liftToOuterList(state, dispatch, itemType, range) }
      else // Outer list node
        { return liftOutOfList(state, dispatch, range) }
    }
  }

  function liftToOuterList(state, dispatch, itemType, range) {
    var tr = state.tr, end = range.end, endOfList = range.$to.end(range.depth);
    if (end < endOfList) {
      // There are siblings after the lifted items, which must become
      // children of the last item
      tr.step(new prosemirrorTransform.ReplaceAroundStep(end - 1, endOfList, end, endOfList,
                                    new dist.Slice(dist.Fragment.from(itemType.create(null, range.parent.copy())), 1, 0), 1, true));
      range = new dist.NodeRange(tr.doc.resolve(range.$from.pos), tr.doc.resolve(endOfList), range.depth);
    }
    dispatch(tr.lift(range, prosemirrorTransform.liftTarget(range)).scrollIntoView());
    return true
  }

  function liftOutOfList(state, dispatch, range) {
    var tr = state.tr, list = range.parent;
    // Merge the list items into a single big item
    for (var pos = range.end, i = range.endIndex - 1, e = range.startIndex; i > e; i--) {
      pos -= list.child(i).nodeSize;
      tr.delete(pos - 1, pos + 1);
    }
    var $start = tr.doc.resolve(range.start), item = $start.nodeAfter;
    var atStart = range.startIndex == 0, atEnd = range.endIndex == list.childCount;
    var parent = $start.node(-1), indexBefore = $start.index(-1);
    if (!parent.canReplace(indexBefore + (atStart ? 0 : 1), indexBefore + 1,
                           item.content.append(atEnd ? dist.Fragment.empty : dist.Fragment.from(list))))
      { return false }
    var start = $start.pos, end = start + item.nodeSize;
    // Strip off the surrounding list. At the sides where we're not at
    // the end of the list, the existing list is closed. At sides where
    // this is the end, it is overwritten to its end.
    tr.step(new prosemirrorTransform.ReplaceAroundStep(start - (atStart ? 1 : 0), end + (atEnd ? 1 : 0), start + 1, end - 1,
                                  new dist.Slice((atStart ? dist.Fragment.empty : dist.Fragment.from(list.copy(dist.Fragment.empty)))
                                            .append(atEnd ? dist.Fragment.empty : dist.Fragment.from(list.copy(dist.Fragment.empty))),
                                            atStart ? 0 : 1, atEnd ? 0 : 1), atStart ? 0 : 1));
    dispatch(tr.scrollIntoView());
    return true
  }

  // :: (NodeType) → (state: EditorState, dispatch: ?(tr: Transaction)) → bool
  // Create a command to sink the list item around the selection down
  // into an inner list.
  function sinkListItem(itemType) {
    return function(state, dispatch) {
      var ref = state.selection;
      var $from = ref.$from;
      var $to = ref.$to;
      var range = $from.blockRange($to, function (node) { return node.childCount && node.firstChild.type == itemType; });
      if (!range) { return false }
      var startIndex = range.startIndex;
      if (startIndex == 0) { return false }
      var parent = range.parent, nodeBefore = parent.child(startIndex - 1);
      if (nodeBefore.type != itemType) { return false }

      if (dispatch) {
        var nestedBefore = nodeBefore.lastChild && nodeBefore.lastChild.type == parent.type;
        var inner = dist.Fragment.from(nestedBefore ? itemType.create() : null);
        var slice = new dist.Slice(dist.Fragment.from(itemType.create(null, dist.Fragment.from(parent.type.create(null, inner)))),
                              nestedBefore ? 3 : 1, 0);
        var before = range.start, after = range.end;
        dispatch(state.tr.step(new prosemirrorTransform.ReplaceAroundStep(before - (nestedBefore ? 3 : 1), after,
                                                     before, after, slice, 1, true))
                 .scrollIntoView());
      }
      return true
    }
  }

  exports.orderedList = orderedList;
  exports.bulletList = bulletList;
  exports.listItem = listItem;
  exports.addListNodes = addListNodes;
  exports.wrapInList = wrapInList;
  exports.splitListItem = splitListItem;
  exports.liftListItem = liftListItem;
  exports.sinkListItem = sinkListItem;

  });

  var schemaList$1 = unwrapExports(schemaList);
  var schemaList_1 = schemaList.orderedList;
  var schemaList_2 = schemaList.bulletList;
  var schemaList_3 = schemaList.listItem;
  var schemaList_4 = schemaList.addListNodes;
  var schemaList_5 = schemaList.wrapInList;
  var schemaList_6 = schemaList.splitListItem;
  var schemaList_7 = schemaList.liftListItem;
  var schemaList_8 = schemaList.sinkListItem;

  var schemaList$2 = /*#__PURE__*/Object.freeze({
    'default': schemaList$1,
    __moduleExports: schemaList,
    orderedList: schemaList_1,
    bulletList: schemaList_2,
    listItem: schemaList_3,
    addListNodes: schemaList_4,
    wrapInList: schemaList_5,
    splitListItem: schemaList_6,
    liftListItem: schemaList_7,
    sinkListItem: schemaList_8
  });

  var dist$b = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, '__esModule', { value: true });




  // ::- Input rules are regular expressions describing a piece of text
  // that, when typed, causes something to happen. This might be
  // changing two dashes into an emdash, wrapping a paragraph starting
  // with `"> "` into a blockquote, or something entirely different.
  var InputRule = function InputRule(match, handler) {
    this.match = match;
    this.handler = typeof handler == "string" ? stringHandler(handler) : handler;
  };

  function stringHandler(string) {
    return function(state, match, start, end) {
      var insert = string;
      if (match[1]) {
        var offset = match[0].lastIndexOf(match[1]);
        insert += match[0].slice(offset + match[1].length);
        start += offset;
        var cutOff = start - end;
        if (cutOff > 0) {
          insert = match[0].slice(offset - cutOff, offset) + insert;
          start = end;
        }
      }
      return state.tr.insertText(insert, start, end)
    }
  }

  var MAX_MATCH = 500;

  // :: (config: {rules: [InputRule]}) → Plugin
  // Create an input rules plugin. When enabled, it will cause text
  // input that matches any of the given rules to trigger the rule's
  // action.
  function inputRules(ref) {
    var rules = ref.rules;

    var plugin = new dist$3.Plugin({
      state: {
        init: function init() { return null },
        apply: function apply(tr, prev) {
          var stored = tr.getMeta(this);
          if (stored) { return stored }
          return tr.selectionSet || tr.docChanged ? null : prev
        }
      },

      props: {
        handleTextInput: function handleTextInput(view, from, to, text) {
          return run(view, from, to, text, rules, plugin)
        },
        handleDOMEvents: {
          compositionend: function (view) {
            setTimeout(function () {
              var ref = view.state.selection;
              var $cursor = ref.$cursor;
              if ($cursor) { run(view, $cursor.pos, $cursor.pos, "", rules, plugin); }
            });
          }
        }
      },

      isInputRules: true
    });
    return plugin
  }

  function run(view, from, to, text, rules, plugin) {
    if (view.composing) { return false }
    var state = view.state, $from = state.doc.resolve(from);
    if ($from.parent.type.spec.code) { return false }
    var textBefore = $from.parent.textBetween(Math.max(0, $from.parentOffset - MAX_MATCH), $from.parentOffset,
                                              null, "\ufffc") + text;
    for (var i = 0; i < rules.length; i++) {
      var match = rules[i].match.exec(textBefore);
      var tr = match && rules[i].handler(state, match, from - (match[0].length - text.length), to);
      if (!tr) { continue }
      view.dispatch(tr.setMeta(plugin, {transform: tr, from: from, to: to, text: text}));
      return true
    }
    return false
  }

  // :: (EditorState, ?(Transaction)) → bool
  // This is a command that will undo an input rule, if applying such a
  // rule was the last thing that the user did.
  function undoInputRule(state, dispatch) {
    var plugins = state.plugins;
    for (var i = 0; i < plugins.length; i++) {
      var plugin = plugins[i], undoable = (void 0);
      if (plugin.spec.isInputRules && (undoable = plugin.getState(state))) {
        if (dispatch) {
          var tr = state.tr, toUndo = undoable.transform;
          for (var j = toUndo.steps.length - 1; j >= 0; j--)
            { tr.step(toUndo.steps[j].invert(toUndo.docs[j])); }
          var marks = tr.doc.resolve(undoable.from).marks();
          dispatch(tr.replaceWith(undoable.from, undoable.to, state.schema.text(undoable.text, marks)));
        }
        return true
      }
    }
    return false
  }

  // :: InputRule Converts double dashes to an emdash.
  var emDash = new InputRule(/--$/, "—");
  // :: InputRule Converts three dots to an ellipsis character.
  var ellipsis = new InputRule(/\.\.\.$/, "…");
  // :: InputRule “Smart” opening double quotes.
  var openDoubleQuote = new InputRule(/(?:^|[\s\{\[\(\<'"\u2018\u201C])(")$/, "“");
  // :: InputRule “Smart” closing double quotes.
  var closeDoubleQuote = new InputRule(/"$/, "”");
  // :: InputRule “Smart” opening single quotes.
  var openSingleQuote = new InputRule(/(?:^|[\s\{\[\(\<'"\u2018\u201C])(')$/, "‘");
  // :: InputRule “Smart” closing single quotes.
  var closeSingleQuote = new InputRule(/'$/, "’");

  // :: [InputRule] Smart-quote related input rules.
  var smartQuotes = [openDoubleQuote, closeDoubleQuote, openSingleQuote, closeSingleQuote];

  // :: (RegExp, NodeType, ?union<Object, ([string]) → ?Object>, ?([string], Node) → bool) → InputRule
  // Build an input rule for automatically wrapping a textblock when a
  // given string is typed. The `regexp` argument is
  // directly passed through to the `InputRule` constructor. You'll
  // probably want the regexp to start with `^`, so that the pattern can
  // only occur at the start of a textblock.
  //
  // `nodeType` is the type of node to wrap in. If it needs attributes,
  // you can either pass them directly, or pass a function that will
  // compute them from the regular expression match.
  //
  // By default, if there's a node with the same type above the newly
  // wrapped node, the rule will try to [join](#transform.Transform.join) those
  // two nodes. You can pass a join predicate, which takes a regular
  // expression match and the node before the wrapped node, and can
  // return a boolean to indicate whether a join should happen.
  function wrappingInputRule(regexp, nodeType, getAttrs, joinPredicate) {
    return new InputRule(regexp, function (state, match, start, end) {
      var attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs;
      var tr = state.tr.delete(start, end);
      var $start = tr.doc.resolve(start), range = $start.blockRange(), wrapping = range && prosemirrorTransform.findWrapping(range, nodeType, attrs);
      if (!wrapping) { return null }
      tr.wrap(range, wrapping);
      var before = tr.doc.resolve(start - 1).nodeBefore;
      if (before && before.type == nodeType && prosemirrorTransform.canJoin(tr.doc, start - 1) &&
          (!joinPredicate || joinPredicate(match, before)))
        { tr.join(start - 1); }
      return tr
    })
  }

  // :: (RegExp, NodeType, ?union<Object, ([string]) → ?Object>) → InputRule
  // Build an input rule that changes the type of a textblock when the
  // matched text is typed into it. You'll usually want to start your
  // regexp with `^` to that it is only matched at the start of a
  // textblock. The optional `getAttrs` parameter can be used to compute
  // the new node's attributes, and works the same as in the
  // `wrappingInputRule` function.
  function textblockTypeInputRule(regexp, nodeType, getAttrs) {
    return new InputRule(regexp, function (state, match, start, end) {
      var $start = state.doc.resolve(start);
      var attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs;
      if (!$start.node(-1).canReplaceWith($start.index(-1), $start.indexAfter(-1), nodeType)) { return null }
      return state.tr
        .delete(start, end)
        .setBlockType(start, start, nodeType, attrs)
    })
  }

  exports.InputRule = InputRule;
  exports.inputRules = inputRules;
  exports.undoInputRule = undoInputRule;
  exports.emDash = emDash;
  exports.ellipsis = ellipsis;
  exports.openDoubleQuote = openDoubleQuote;
  exports.closeDoubleQuote = closeDoubleQuote;
  exports.openSingleQuote = openSingleQuote;
  exports.closeSingleQuote = closeSingleQuote;
  exports.smartQuotes = smartQuotes;
  exports.wrappingInputRule = wrappingInputRule;
  exports.textblockTypeInputRule = textblockTypeInputRule;

  });

  var index$3 = unwrapExports(dist$b);
  var dist_1$6 = dist$b.InputRule;
  var dist_2$6 = dist$b.inputRules;
  var dist_3$5 = dist$b.undoInputRule;
  var dist_4$5 = dist$b.emDash;
  var dist_5$5 = dist$b.ellipsis;
  var dist_6$5 = dist$b.openDoubleQuote;
  var dist_7$4 = dist$b.closeDoubleQuote;
  var dist_8$4 = dist$b.openSingleQuote;
  var dist_9$4 = dist$b.closeSingleQuote;
  var dist_10$3 = dist$b.smartQuotes;
  var dist_11$3 = dist$b.wrappingInputRule;
  var dist_12$3 = dist$b.textblockTypeInputRule;

  var dist$c = /*#__PURE__*/Object.freeze({
    'default': index$3,
    __moduleExports: dist$b,
    InputRule: dist_1$6,
    inputRules: dist_2$6,
    undoInputRule: dist_3$5,
    emDash: dist_4$5,
    ellipsis: dist_5$5,
    openDoubleQuote: dist_6$5,
    closeDoubleQuote: dist_7$4,
    openSingleQuote: dist_8$4,
    closeSingleQuote: dist_9$4,
    smartQuotes: dist_10$3,
    wrappingInputRule: dist_11$3,
    textblockTypeInputRule: dist_12$3
  });

  var prosemirrorDropcursor = ( dropcursor$2 && dropcursor$1 ) || dropcursor$2;

  var prosemirrorGapcursor = ( dist$8 && index$1 ) || dist$8;

  var prosemirrorMenu = ( dist$a && index$2 ) || dist$a;

  var prosemirrorSchemaList = ( schemaList$2 && schemaList$1 ) || schemaList$2;

  var prosemirrorInputrules = ( dist$c && index$3 ) || dist$c;

  var dist$d = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, '__esModule', { value: true });











  var prefix = "ProseMirror-prompt";

  function openPrompt(options) {
    var wrapper = document.body.appendChild(document.createElement("div"));
    wrapper.className = prefix;

    var mouseOutside = function (e) { if (!wrapper.contains(e.target)) { close(); } };
    setTimeout(function () { return window.addEventListener("mousedown", mouseOutside); }, 50);
    var close = function () {
      window.removeEventListener("mousedown", mouseOutside);
      if (wrapper.parentNode) { wrapper.parentNode.removeChild(wrapper); }
    };

    var domFields = [];
    for (var name in options.fields) { domFields.push(options.fields[name].render()); }

    var submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.className = prefix + "-submit";
    submitButton.textContent = "OK";
    var cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className = prefix + "-cancel";
    cancelButton.textContent = "Cancel";
    cancelButton.addEventListener("click", close);

    var form = wrapper.appendChild(document.createElement("form"));
    if (options.title) { form.appendChild(document.createElement("h5")).textContent = options.title; }
    domFields.forEach(function (field) {
      form.appendChild(document.createElement("div")).appendChild(field);
    });
    var buttons = form.appendChild(document.createElement("div"));
    buttons.className = prefix + "-buttons";
    buttons.appendChild(submitButton);
    buttons.appendChild(document.createTextNode(" "));
    buttons.appendChild(cancelButton);

    var box = wrapper.getBoundingClientRect();
    wrapper.style.top = ((window.innerHeight - box.height) / 2) + "px";
    wrapper.style.left = ((window.innerWidth - box.width) / 2) + "px";

    var submit = function () {
      var params = getValues(options.fields, domFields);
      if (params) {
        close();
        options.callback(params);
      }
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      submit();
    });

    form.addEventListener("keydown", function (e) {
      if (e.keyCode == 27) {
        e.preventDefault();
        close();
      } else if (e.keyCode == 13 && !(e.ctrlKey || e.metaKey || e.shiftKey)) {
        e.preventDefault();
        submit();
      } else if (e.keyCode == 9) {
        window.setTimeout(function () {
          if (!wrapper.contains(document.activeElement)) { close(); }
        }, 500);
      }
    });

    var input = form.elements[0];
    if (input) { input.focus(); }
  }

  function getValues(fields, domFields) {
    var result = Object.create(null), i = 0;
    for (var name in fields) {
      var field = fields[name], dom = domFields[i++];
      var value = field.read(dom), bad = field.validate(value);
      if (bad) {
        reportInvalid(dom, bad);
        return null
      }
      result[name] = field.clean(value);
    }
    return result
  }

  function reportInvalid(dom, message) {
    // FIXME this is awful and needs a lot more work
    var parent = dom.parentNode;
    var msg = parent.appendChild(document.createElement("div"));
    msg.style.left = (dom.offsetLeft + dom.offsetWidth + 2) + "px";
    msg.style.top = (dom.offsetTop - 5) + "px";
    msg.className = "ProseMirror-invalid";
    msg.textContent = message;
    setTimeout(function () { return parent.removeChild(msg); }, 1500);
  }

  // ::- The type of field that `FieldPrompt` expects to be passed to it.
  var Field = function Field(options) { this.options = options; };

  // render:: (state: EditorState, props: Object) → dom.Node
  // Render the field to the DOM. Should be implemented by all subclasses.

  // :: (dom.Node) → any
  // Read the field's value from its DOM node.
  Field.prototype.read = function read (dom) { return dom.value };

  // :: (any) → ?string
  // A field-type-specific validation function.
  Field.prototype.validateType = function validateType (_value) {};

  Field.prototype.validate = function validate (value) {
    if (!value && this.options.required)
      { return "Required field" }
    return this.validateType(value) || (this.options.validate && this.options.validate(value))
  };

  Field.prototype.clean = function clean (value) {
    return this.options.clean ? this.options.clean(value) : value
  };

  // ::- A field class for single-line text fields.
  var TextField = (function (Field) {
    function TextField () {
      Field.apply(this, arguments);
    }

    if ( Field ) TextField.__proto__ = Field;
    TextField.prototype = Object.create( Field && Field.prototype );
    TextField.prototype.constructor = TextField;

    TextField.prototype.render = function render () {
      var input = document.createElement("input");
      input.type = "text";
      input.placeholder = this.options.label;
      input.value = this.options.value || "";
      input.autocomplete = "off";
      return input
    };

    return TextField;
  }(Field));


  // ::- A field class for dropdown fields based on a plain `<select>`
  // tag. Expects an option `options`, which should be an array of
  // `{value: string, label: string}` objects, or a function taking a
  // `ProseMirror` instance and returning such an array.
  var SelectField = (function (Field) {
    function SelectField () {
      Field.apply(this, arguments);
    }

    if ( Field ) SelectField.__proto__ = Field;
    SelectField.prototype = Object.create( Field && Field.prototype );
    SelectField.prototype.constructor = SelectField;

    SelectField.prototype.render = function render () {
      var this$1 = this;

      var select = document.createElement("select");
      this.options.options.forEach(function (o) {
        var opt = select.appendChild(document.createElement("option"));
        opt.value = o.value;
        opt.selected = o.value == this$1.options.value;
        opt.label = o.label;
      });
      return select
    };

    return SelectField;
  }(Field));

  // Helpers to create specific types of items

  function canInsert(state, nodeType) {
    var $from = state.selection.$from;
    for (var d = $from.depth; d >= 0; d--) {
      var index = $from.index(d);
      if ($from.node(d).canReplaceWith(index, index, nodeType)) { return true }
    }
    return false
  }

  function insertImageItem(nodeType) {
    return new prosemirrorMenu.MenuItem({
      title: "Insert image",
      label: "Image",
      enable: function enable(state) { return canInsert(state, nodeType) },
      run: function run(state, _, view) {
        var ref = state.selection;
        var from = ref.from;
        var to = ref.to;
        var attrs = null;
        if (state.selection instanceof dist$3.NodeSelection && state.selection.node.type == nodeType)
          { attrs = state.selection.node.attrs; }
        openPrompt({
          title: "Insert image",
          fields: {
            src: new TextField({label: "Location", required: true, value: attrs && attrs.src}),
            title: new TextField({label: "Title", value: attrs && attrs.title}),
            alt: new TextField({label: "Description",
                                value: attrs ? attrs.alt : state.doc.textBetween(from, to, " ")})
          },
          callback: function callback(attrs) {
            view.dispatch(view.state.tr.replaceSelectionWith(nodeType.createAndFill(attrs)));
            view.focus();
          }
        });
      }
    })
  }

  function cmdItem(cmd, options) {
    var passedOptions = {
      label: options.title,
      run: cmd
    };
    for (var prop in options) { passedOptions[prop] = options[prop]; }
    if ((!options.enable || options.enable === true) && !options.select)
      { passedOptions[options.enable ? "enable" : "select"] = function (state) { return cmd(state); }; }

    return new prosemirrorMenu.MenuItem(passedOptions)
  }

  function markActive(state, type) {
    var ref = state.selection;
    var from = ref.from;
    var $from = ref.$from;
    var to = ref.to;
    var empty = ref.empty;
    if (empty) { return type.isInSet(state.storedMarks || $from.marks()) }
    else { return state.doc.rangeHasMark(from, to, type) }
  }

  function markItem(markType, options) {
    var passedOptions = {
      active: function active(state) { return markActive(state, markType) },
      enable: true
    };
    for (var prop in options) { passedOptions[prop] = options[prop]; }
    return cmdItem(prosemirrorCommands.toggleMark(markType), passedOptions)
  }

  function linkItem(markType) {
    return new prosemirrorMenu.MenuItem({
      title: "Add or remove link",
      icon: prosemirrorMenu.icons.link,
      active: function active(state) { return markActive(state, markType) },
      enable: function enable(state) { return !state.selection.empty },
      run: function run(state, dispatch, view) {
        if (markActive(state, markType)) {
          prosemirrorCommands.toggleMark(markType)(state, dispatch);
          return true
        }
        openPrompt({
          title: "Create a link",
          fields: {
            href: new TextField({
              label: "Link target",
              required: true
            }),
            title: new TextField({label: "Title"})
          },
          callback: function callback(attrs) {
            prosemirrorCommands.toggleMark(markType, attrs)(view.state, view.dispatch);
            view.focus();
          }
        });
      }
    })
  }

  function wrapListItem(nodeType, options) {
    return cmdItem(prosemirrorSchemaList.wrapInList(nodeType, options.attrs), options)
  }

  // :: (Schema) → Object
  // Given a schema, look for default mark and node types in it and
  // return an object with relevant menu items relating to those marks:
  //
  // **`toggleStrong`**`: MenuItem`
  //   : A menu item to toggle the [strong mark](#schema-basic.StrongMark).
  //
  // **`toggleEm`**`: MenuItem`
  //   : A menu item to toggle the [emphasis mark](#schema-basic.EmMark).
  //
  // **`toggleCode`**`: MenuItem`
  //   : A menu item to toggle the [code font mark](#schema-basic.CodeMark).
  //
  // **`toggleLink`**`: MenuItem`
  //   : A menu item to toggle the [link mark](#schema-basic.LinkMark).
  //
  // **`insertImage`**`: MenuItem`
  //   : A menu item to insert an [image](#schema-basic.Image).
  //
  // **`wrapBulletList`**`: MenuItem`
  //   : A menu item to wrap the selection in a [bullet list](#schema-list.BulletList).
  //
  // **`wrapOrderedList`**`: MenuItem`
  //   : A menu item to wrap the selection in an [ordered list](#schema-list.OrderedList).
  //
  // **`wrapBlockQuote`**`: MenuItem`
  //   : A menu item to wrap the selection in a [block quote](#schema-basic.BlockQuote).
  //
  // **`makeParagraph`**`: MenuItem`
  //   : A menu item to set the current textblock to be a normal
  //     [paragraph](#schema-basic.Paragraph).
  //
  // **`makeCodeBlock`**`: MenuItem`
  //   : A menu item to set the current textblock to be a
  //     [code block](#schema-basic.CodeBlock).
  //
  // **`makeHead[N]`**`: MenuItem`
  //   : Where _N_ is 1 to 6. Menu items to set the current textblock to
  //     be a [heading](#schema-basic.Heading) of level _N_.
  //
  // **`insertHorizontalRule`**`: MenuItem`
  //   : A menu item to insert a horizontal rule.
  //
  // The return value also contains some prefabricated menu elements and
  // menus, that you can use instead of composing your own menu from
  // scratch:
  //
  // **`insertMenu`**`: Dropdown`
  //   : A dropdown containing the `insertImage` and
  //     `insertHorizontalRule` items.
  //
  // **`typeMenu`**`: Dropdown`
  //   : A dropdown containing the items for making the current
  //     textblock a paragraph, code block, or heading.
  //
  // **`fullMenu`**`: [[MenuElement]]`
  //   : An array of arrays of menu elements for use as the full menu
  //     for, for example the [menu bar](https://github.com/prosemirror/prosemirror-menu#user-content-menubar).
  function buildMenuItems(schema) {
    var r = {}, type;
    if (type = schema.marks.strong)
      { r.toggleStrong = markItem(type, {title: "Toggle strong style", icon: prosemirrorMenu.icons.strong}); }
    if (type = schema.marks.em)
      { r.toggleEm = markItem(type, {title: "Toggle emphasis", icon: prosemirrorMenu.icons.em}); }
    if (type = schema.marks.code)
      { r.toggleCode = markItem(type, {title: "Toggle code font", icon: prosemirrorMenu.icons.code}); }
    if (type = schema.marks.link)
      { r.toggleLink = linkItem(type); }

    if (type = schema.nodes.image)
      { r.insertImage = insertImageItem(type); }
    if (type = schema.nodes.bullet_list)
      { r.wrapBulletList = wrapListItem(type, {
        title: "Wrap in bullet list",
        icon: prosemirrorMenu.icons.bulletList
      }); }
    if (type = schema.nodes.ordered_list)
      { r.wrapOrderedList = wrapListItem(type, {
        title: "Wrap in ordered list",
        icon: prosemirrorMenu.icons.orderedList
      }); }
    if (type = schema.nodes.blockquote)
      { r.wrapBlockQuote = prosemirrorMenu.wrapItem(type, {
        title: "Wrap in block quote",
        icon: prosemirrorMenu.icons.blockquote
      }); }
    if (type = schema.nodes.paragraph)
      { r.makeParagraph = prosemirrorMenu.blockTypeItem(type, {
        title: "Change to paragraph",
        label: "Plain"
      }); }
    if (type = schema.nodes.code_block)
      { r.makeCodeBlock = prosemirrorMenu.blockTypeItem(type, {
        title: "Change to code block",
        label: "Code"
      }); }
    if (type = schema.nodes.heading)
      { for (var i = 1; i <= 10; i++)
        { r["makeHead" + i] = prosemirrorMenu.blockTypeItem(type, {
          title: "Change to heading " + i,
          label: "Level " + i,
          attrs: {level: i}
        }); } }
    if (type = schema.nodes.horizontal_rule) {
      var hr = type;
      r.insertHorizontalRule = new prosemirrorMenu.MenuItem({
        title: "Insert horizontal rule",
        label: "Horizontal rule",
        enable: function enable(state) { return canInsert(state, hr) },
        run: function run(state, dispatch) { dispatch(state.tr.replaceSelectionWith(hr.create())); }
      });
    }

    var cut = function (arr) { return arr.filter(function (x) { return x; }); };
    r.insertMenu = new prosemirrorMenu.Dropdown(cut([r.insertImage, r.insertHorizontalRule]), {label: "Insert"});
    r.typeMenu = new prosemirrorMenu.Dropdown(cut([r.makeParagraph, r.makeCodeBlock, r.makeHead1 && new prosemirrorMenu.DropdownSubmenu(cut([
      r.makeHead1, r.makeHead2, r.makeHead3, r.makeHead4, r.makeHead5, r.makeHead6
    ]), {label: "Heading"})]), {label: "Type..."});

    r.inlineMenu = [cut([r.toggleStrong, r.toggleEm, r.toggleCode, r.toggleLink])];
    r.blockMenu = [cut([r.wrapBulletList, r.wrapOrderedList, r.wrapBlockQuote, prosemirrorMenu.joinUpItem,
                        prosemirrorMenu.liftItem, prosemirrorMenu.selectParentNodeItem])];
    r.fullMenu = r.inlineMenu.concat([[r.insertMenu, r.typeMenu]], [[prosemirrorMenu.undoItem, prosemirrorMenu.redoItem]], r.blockMenu);

    return r
  }

  var mac = typeof navigator != "undefined" ? /Mac/.test(navigator.platform) : false;

  // :: (Schema, ?Object) → Object
  // Inspect the given schema looking for marks and nodes from the
  // basic schema, and if found, add key bindings related to them.
  // This will add:
  //
  // * **Mod-b** for toggling [strong](#schema-basic.StrongMark)
  // * **Mod-i** for toggling [emphasis](#schema-basic.EmMark)
  // * **Mod-`** for toggling [code font](#schema-basic.CodeMark)
  // * **Ctrl-Shift-0** for making the current textblock a paragraph
  // * **Ctrl-Shift-1** to **Ctrl-Shift-Digit6** for making the current
  //   textblock a heading of the corresponding level
  // * **Ctrl-Shift-Backslash** to make the current textblock a code block
  // * **Ctrl-Shift-8** to wrap the selection in an ordered list
  // * **Ctrl-Shift-9** to wrap the selection in a bullet list
  // * **Ctrl->** to wrap the selection in a block quote
  // * **Enter** to split a non-empty textblock in a list item while at
  //   the same time splitting the list item
  // * **Mod-Enter** to insert a hard break
  // * **Mod-_** to insert a horizontal rule
  // * **Backspace** to undo an input rule
  // * **Alt-ArrowUp** to `joinUp`
  // * **Alt-ArrowDown** to `joinDown`
  // * **Mod-BracketLeft** to `lift`
  // * **Escape** to `selectParentNode`
  //
  // You can suppress or map these bindings by passing a `mapKeys`
  // argument, which maps key names (say `"Mod-B"` to either `false`, to
  // remove the binding, or a new key name string.
  function buildKeymap(schema, mapKeys) {
    var keys = {}, type;
    function bind(key, cmd) {
      if (mapKeys) {
        var mapped = mapKeys[key];
        if (mapped === false) { return }
        if (mapped) { key = mapped; }
      }
      keys[key] = cmd;
    }


    bind("Mod-z", prosemirrorHistory.undo);
    bind("Shift-Mod-z", prosemirrorHistory.redo);
    bind("Backspace", prosemirrorInputrules.undoInputRule);
    if (!mac) { bind("Mod-y", prosemirrorHistory.redo); }

    bind("Alt-ArrowUp", prosemirrorCommands.joinUp);
    bind("Alt-ArrowDown", prosemirrorCommands.joinDown);
    bind("Mod-BracketLeft", prosemirrorCommands.lift);
    bind("Escape", prosemirrorCommands.selectParentNode);

    if (type = schema.marks.strong)
      { bind("Mod-b", prosemirrorCommands.toggleMark(type)); }
    if (type = schema.marks.em)
      { bind("Mod-i", prosemirrorCommands.toggleMark(type)); }
    if (type = schema.marks.code)
      { bind("Mod-`", prosemirrorCommands.toggleMark(type)); }

    if (type = schema.nodes.bullet_list)
      { bind("Shift-Ctrl-8", prosemirrorSchemaList.wrapInList(type)); }
    if (type = schema.nodes.ordered_list)
      { bind("Shift-Ctrl-9", prosemirrorSchemaList.wrapInList(type)); }
    if (type = schema.nodes.blockquote)
      { bind("Ctrl->", prosemirrorCommands.wrapIn(type)); }
    if (type = schema.nodes.hard_break) {
      var br = type, cmd = prosemirrorCommands.chainCommands(prosemirrorCommands.exitCode, function (state, dispatch) {
        dispatch(state.tr.replaceSelectionWith(br.create()).scrollIntoView());
        return true
      });
      bind("Mod-Enter", cmd);
      bind("Shift-Enter", cmd);
      if (mac) { bind("Ctrl-Enter", cmd); }
    }
    if (type = schema.nodes.list_item) {
      bind("Enter", prosemirrorSchemaList.splitListItem(type));
      bind("Mod-[", prosemirrorSchemaList.liftListItem(type));
      bind("Mod-]", prosemirrorSchemaList.sinkListItem(type));
    }
    if (type = schema.nodes.paragraph)
      { bind("Shift-Ctrl-0", prosemirrorCommands.setBlockType(type)); }
    if (type = schema.nodes.code_block)
      { bind("Shift-Ctrl-\\", prosemirrorCommands.setBlockType(type)); }
    if (type = schema.nodes.heading)
      { for (var i = 1; i <= 6; i++) { bind("Shift-Ctrl-" + i, prosemirrorCommands.setBlockType(type, {level: i})); } }
    if (type = schema.nodes.horizontal_rule) {
      var hr = type;
      bind("Mod-_", function (state, dispatch) {
        dispatch(state.tr.replaceSelectionWith(hr.create()).scrollIntoView());
        return true
      });
    }

    return keys
  }

  // : (NodeType) → InputRule
  // Given a blockquote node type, returns an input rule that turns `"> "`
  // at the start of a textblock into a blockquote.
  function blockQuoteRule(nodeType) {
    return prosemirrorInputrules.wrappingInputRule(/^\s*>\s$/, nodeType)
  }

  // : (NodeType) → InputRule
  // Given a list node type, returns an input rule that turns a number
  // followed by a dot at the start of a textblock into an ordered list.
  function orderedListRule(nodeType) {
    return prosemirrorInputrules.wrappingInputRule(/^(\d+)\.\s$/, nodeType, function (match) { return ({order: +match[1]}); },
                             function (match, node) { return node.childCount + node.attrs.order == +match[1]; })
  }

  // : (NodeType) → InputRule
  // Given a list node type, returns an input rule that turns a bullet
  // (dash, plush, or asterisk) at the start of a textblock into a
  // bullet list.
  function bulletListRule(nodeType) {
    return prosemirrorInputrules.wrappingInputRule(/^\s*([-+*])\s$/, nodeType)
  }

  // : (NodeType) → InputRule
  // Given a code block node type, returns an input rule that turns a
  // textblock starting with three backticks into a code block.
  function codeBlockRule(nodeType) {
    return prosemirrorInputrules.textblockTypeInputRule(/^```$/, nodeType)
  }

  // : (NodeType, number) → InputRule
  // Given a node type and a maximum level, creates an input rule that
  // turns up to that number of `#` characters followed by a space at
  // the start of a textblock into a heading whose level corresponds to
  // the number of `#` signs.
  function headingRule(nodeType, maxLevel) {
    return prosemirrorInputrules.textblockTypeInputRule(new RegExp("^(#{1," + maxLevel + "})\\s$"),
                                  nodeType, function (match) { return ({level: match[1].length}); })
  }

  // : (Schema) → Plugin
  // A set of input rules for creating the basic block quotes, lists,
  // code blocks, and heading.
  function buildInputRules(schema) {
    var rules = prosemirrorInputrules.smartQuotes.concat(prosemirrorInputrules.ellipsis, prosemirrorInputrules.emDash), type;
    if (type = schema.nodes.blockquote) { rules.push(blockQuoteRule(type)); }
    if (type = schema.nodes.ordered_list) { rules.push(orderedListRule(type)); }
    if (type = schema.nodes.bullet_list) { rules.push(bulletListRule(type)); }
    if (type = schema.nodes.code_block) { rules.push(codeBlockRule(type)); }
    if (type = schema.nodes.heading) { rules.push(headingRule(type, 6)); }
    return prosemirrorInputrules.inputRules({rules: rules})
  }

  // !! This module exports helper functions for deriving a set of basic
  // menu items, input rules, or key bindings from a schema. These
  // values need to know about the schema for two reasons—they need
  // access to specific instances of node and mark types, and they need
  // to know which of the node and mark types that they know about are
  // actually present in the schema.
  //
  // The `exampleSetup` plugin ties these together into a plugin that
  // will automatically enable this basic functionality in an editor.

  // :: (Object) → [Plugin]
  // A convenience plugin that bundles together a simple menu with basic
  // key bindings, input rules, and styling for the example schema.
  // Probably only useful for quickly setting up a passable
  // editor—you'll need more control over your settings in most
  // real-world situations.
  //
  //   options::- The following options are recognized:
  //
  //     schema:: Schema
  //     The schema to generate key bindings and menu items for.
  //
  //     mapKeys:: ?Object
  //     Can be used to [adjust](#example-setup.buildKeymap) the key bindings created.
  //
  //     menuBar:: ?bool
  //     Set to false to disable the menu bar.
  //
  //     history:: ?bool
  //     Set to false to disable the history plugin.
  //
  //     floatingMenu:: ?bool
  //     Set to false to make the menu bar non-floating.
  //
  //     menuContent:: [[MenuItem]]
  //     Can be used to override the menu content.
  function exampleSetup(options) {
    var plugins = [
      buildInputRules(options.schema),
      keymap_1.keymap(buildKeymap(options.schema, options.mapKeys)),
      keymap_1.keymap(prosemirrorCommands.baseKeymap),
      prosemirrorDropcursor.dropCursor(),
      prosemirrorGapcursor.gapCursor()
    ];
    if (options.menuBar !== false)
      { plugins.push(prosemirrorMenu.menuBar({floating: options.floatingMenu !== false,
                            content: options.menuContent || buildMenuItems(options.schema).fullMenu})); }
    if (options.history !== false)
      { plugins.push(prosemirrorHistory.history()); }

    return plugins.concat(new dist$3.Plugin({
      props: {
        attributes: {class: "ProseMirror-example-setup-style"}
      }
    }))
  }

  exports.buildMenuItems = buildMenuItems;
  exports.buildKeymap = buildKeymap;
  exports.buildInputRules = buildInputRules;
  exports.exampleSetup = exampleSetup;

  });

  unwrapExports(dist$d);
  var dist_1$7 = dist$d.buildMenuItems;
  var dist_2$7 = dist$d.buildKeymap;
  var dist_3$6 = dist$d.buildInputRules;
  var dist_4$6 = dist$d.exampleSetup;

  /* eslint-env browser */

  function load( contentDOM ){

  	const ydoc = new Doc();
  	const provider = new WebsocketProvider(`${location.protocol === 'http:' ? 'ws:' : 'wss:'}${location.host}`, 'prosemirror', ydoc);
  	const type = ydoc.get('prosemirror', YXmlFragment);

  	const editor = document.createElement('div');
  	editor.setAttribute('id', 'editor');
  	const editorContainer = document.createElement('div');
  	editorContainer.insertBefore(editor, null);

  	const prosemirrorState = dist_7$2.create({
  		doc: contentDOM ? dist_12.fromSchema( schema ).parse( contentDOM ) : null ,
  		schema,
  		plugins: [
  			ySyncPlugin(type),
  			yCursorPlugin(provider.awareness),
  			yUndoPlugin,
  			keymap_2({
  					'Mod-z': undo,
  					'Mod-y': redo,
  					'Mod-Shift-z': redo
  					})
  			].concat(dist_4$6({ schema }))
  	});
  	const prosemirrorView = new dist_1$3(editor, { state : prosemirrorState } );
  	document.body.insertBefore(editorContainer, null);

  	prosemirrorView.focus();

  	const connectBtn = document.querySelector('.y-connect-btn');
  	connectBtn.addEventListener('click', () => {
  		if (provider.wsconnected) {
  			provider.disconnect();
  			connectBtn.textContent = 'Connect';
  		} else {
  			provider.connect();
  			connectBtn.textContent = 'Disconnect';
  		}
  	});

  	function save(){
  	    return dist_13.fromSchema(schema).serializeFragment( prosemirrorView.state.doc.content );
  	}

  	window.prosemirror = { provider, ydoc, type, prosemirrorView, load, save };
  }


  window.addEventListener('load', load );

}());
//# sourceMappingURL=prosemirror.js.map
