var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { utils } from "ethers";
import { Literal, Record, String, Union, Array as RunTypesArray } from "runtypes";
import { getVerificationMethod } from "./resolver";
import { Reason, OpenAttestationSignatureCode } from "../types/error";
import { CodedError } from "../common/error";
export var ValidDidVerificationStatus = Record({
    verified: Literal(true),
    did: String,
});
export var ValidDidVerificationStatusArray = RunTypesArray(ValidDidVerificationStatus).withConstraint(function (elements) { return elements.length > 0 || "Expect at least one valid element"; });
export var InvalidDidVerificationStatus = Record({
    verified: Literal(false),
    did: String,
    reason: Reason,
});
export var DidVerificationStatus = Union(ValidDidVerificationStatus, InvalidDidVerificationStatus);
export var DidVerificationStatusArray = RunTypesArray(DidVerificationStatus);
export var verifySecp256k1VerificationKey2018 = function (_a) {
    var did = _a.did, verificationMethod = _a.verificationMethod, merkleRoot = _a.merkleRoot, signature = _a.signature;
    var messageBytes = utils.arrayify(merkleRoot);
    var blockchainAccountId = verificationMethod.blockchainAccountId;
    if (!blockchainAccountId) {
        return {
            did: did,
            verified: false,
            reason: {
                code: OpenAttestationSignatureCode.KEY_MISSING,
                codeString: OpenAttestationSignatureCode[OpenAttestationSignatureCode.KEY_MISSING],
                message: "ethereumAddress not found on public key " + JSON.stringify(verificationMethod),
            },
        };
    }
    // blockchainAccountId looks like 0x0cE1854a3836daF9130028Cf90D6d35B1Ae46457@eip155:3, let's get rid of the part after @, @ included
    var ethereumAddress = blockchainAccountId.split("@")[0];
    var merkleRootSigned = utils.verifyMessage(messageBytes, signature).toLowerCase() === ethereumAddress.toLowerCase();
    if (!merkleRootSigned) {
        return {
            did: did,
            verified: false,
            reason: {
                code: OpenAttestationSignatureCode.WRONG_SIGNATURE,
                codeString: OpenAttestationSignatureCode[OpenAttestationSignatureCode.WRONG_SIGNATURE],
                message: "merkle root is not signed correctly by " + ethereumAddress,
            },
        };
    }
    return {
        did: did,
        verified: true,
    };
};
export var verifySignature = function (_a) {
    var key = _a.key, merkleRoot = _a.merkleRoot, signature = _a.signature, did = _a.did, resolver = _a.resolver;
    return __awaiter(void 0, void 0, void 0, function () {
        var verificationMethod;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getVerificationMethod(did, key, resolver)];
                case 1:
                    verificationMethod = _b.sent();
                    if (!verificationMethod)
                        throw new CodedError("No public key found on DID document for the DID " + did + " and key " + key, OpenAttestationSignatureCode.KEY_NOT_IN_DID, "KEY_NOT_IN_DID");
                    switch (verificationMethod.type) {
                        case "EcdsaSecp256k1RecoveryMethod2020":
                            return [2 /*return*/, verifySecp256k1VerificationKey2018({
                                    did: did,
                                    verificationMethod: verificationMethod,
                                    merkleRoot: merkleRoot,
                                    signature: signature,
                                })];
                        default:
                            throw new CodedError("Signature type " + verificationMethod.type + " is currently not support", OpenAttestationSignatureCode.UNSUPPORTED_KEY_TYPE, "UNSUPPORTED_KEY_TYPE");
                    }
                    return [2 /*return*/];
            }
        });
    });
};
