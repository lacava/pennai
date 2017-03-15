export const initialDatasets =  [
    {
        "name": "Gametes"
    },
    {
        "name": "Adults"
    },
    {
        "name": "Thyroid"
    },
    {
        "name": "Breast Cancer"
    },
    {
        "name": "Hypothyroid"
    },
    {
        "name": "Mushrooms"
    }
];
export const initialAlgorithms = [
    {
        "name": "BernoulliNB",
        "params": {
            "alpha": {
                "help": "Additive (Laplace/Lidstone) smoothing parameter (0 for no smoothing).",
                "accepts": "float",
                "default": 1.0,
                "accepts": "int",
                "ui": {
                    "style": "radio",
                    "choices": [0.001, 0.01, 0.1, 1.0, 10.0, 100.0]
                }
            },
            "binarize": {
                "help": "Threshold for binarizing (mapping to booleans) of sample features. If None, input is presumed to already consist of binary vectors.",
                "accepts": "float",
                "default": 0.0,
                "ui": {
                    "style": "radio",
                    "choices": [0.0, 0.25, 0.5, 0.75, 1.0]
                }
            },
            "fit_prior": {
                "alias": "fit prior",
                "help": "Whether to learn class prior probabilities or not. If false, a uniform prior will be used.",
                "accepts": "bool",
                "default": "true",
                "ui": {
                    "style": "radio",
                    "choices": ["true", "false"]
                }
            }
        }
    },
    {
        "name":  "GaussianNB",
        "params": {}
    },
    {
        "name": "LinearSVC",
        "params": {
            "penalty": {
                "help": "Specifies the norm used in the penalization. The ‘l2’ penalty is the standard used in SVC. The ‘l1’ leads to coef_ vectors that are sparse.",
                "type": "string",
                "default": "l2",
                "ui": {
                    "style": "radio",
                    "choices": ["l1", "l2"]
                }
            },
            "loss": {
                "help": "Specifies the loss function. ‘hinge’ is the standard SVM loss (used e.g. by the SVC class) while ‘squared_hinge’ is the square of the hinge loss.",
                "type": "string",
                "default": "squared_hinge",
                "ui": {
                    "style": "radio",
                    "choices": ["hinge", "squared_hinge"]
                }
            },
            "dual": {
                "help": "Select the algorithm to either solve the dual or primal optimization problem. Prefer dual=False when n_samples > n_features.",
                "type": "bool",
                "default": "true",
                "ui": {
                    "style": "radio",
                    "choices": ["true", "false"]
                }
            },
            "tol": {
                "help": "Tolerance for stopping criteria.",
                "type": "float",
                "default": 0.0001,
                "ui": {
                    "style": "radio",
                    "choices": [0.00001, 0.0001, 0.001, 0.01, 0.1]
                }
            },
            "C": {
                "help": "Penalty parameter C of the error term.",
                "type": "float",
                "default": 1.0,
                "ui": {
                    "style": "radio",
                    "choices": [0.0001, 0.001, 0.01, 0.1, 0.5, 1.0, 10.0, 25.0]
                }
            }
        }
    },{
        "name": "LinearSVR",
        "params": {
            "loss": {
                "help": "Specifies the loss function. ‘l1’ is the epsilon-insensitive loss (standard SVR) while ‘l2’ is the squared epsilon-insensitive loss.",
                "type": "string",
                "default": "epsilon_insensitive",
                "ui": {
                    "style": "radio",
                    "choices": ["epsilon_insensitive", "squared_epsilon_insensitive"]
                }
            },
            "dual": {
                "help": "Select the algorithm to either solve the dual or primal optimization problem. Prefer dual=False when n_samples > n_features.",
                "type": "bool",
                "default": "true",
                "ui": {
                    "style": "radio",
                    "choices": ["true", "false"]
                }
            },
            "tol": {
                "help": "Tolerance for stopping criteria.",
                "type": "float",
                "default": 0.0001,
                "ui": {
                    "style": "radio",
                    "choices": [0.00001, 0.0001, 0.001, 0.01, 0.1]
                }
            },
            "C": {
                "help": "Penalty parameter C of the error term. The penalty is a squared l2 penalty. The bigger this parameter, the less regularization is used.",
                "type": "float",
                "default": 1.0,
                "ui": {
                    "style": "radio",
                    "choices": [0.0001, 0.001, 0.01, 0.1, 0.5, 1.0, 10.0, 25.0]
                }
            },
            "epsilon": {
                "help": "Epsilon parameter in the epsilon-insensitive loss function. Note that the value of this parameter depends on the scale of the target variable y. If unsure, set epsilon=0.",
                "type": "float",
                "default": 0.0,
                "ui": {
                    "style": "radio",
                    "choices": [0.0, 0.0001, 0.001, 0.01, 0.1, 1.0]
                }
            }
        }
    },
    {
        "name": "LogisticRegression",
        "params": {
            "penalty": {
                "help": "Used to specify the norm used in the penalization. The ‘newton-cg’, ‘sag’ and ‘lbfgs’ solvers support only l2 penalties.",
                "type": "string",
                "default": "l2",
                "ui": {
                    "style": "radio",
                    "choices": ["l1", "l2"]
                }
            },
            "C": {
                "help": "Inverse of regularization strength; must be a positive float. Like in support vector machines, smaller values specify stronger regularization.",
                "type": "float",
                "default": 1.0,
                "ui": {
                    "style": "radio",
                    "choices": [0.0001, 0.001, 0.01, 0.1, 0.5, 1.0, 10.0, 25.0]
                }
            },
            "dual": {
                "help": "Select the algorithm to either solve the dual or primal optimization problem. Prefer dual=False when n_samples > n_features.",
                "type": "bool",
                "default": "false",
                "ui": {
                    "style": "radio",
                    "choices": ["true", "false"]
                }
            }
        }
    },
    {
        "name": "ElasticNetCV",
        "params": {
            "l1_ratio": {
                "help": "Float between 0 and 1 passed to ElasticNet (scaling between l1 and l2 penalties).",
                "type": "float",
                "default": 0.5,
                "ui": {
                    "style": "radio",
                    "choices": [0.0, 0.25, 0.5, 0.75, 1.0]
                }
            },
            "tol": {
                "help": "The tolerance for the optimization: if the updates are smaller than tol, the optimization code checks the dual gap for optimality and continues until it is smaller than tol.",
                "type": "float",
                "default": 0.0001,
                "ui": {
                    "style": "radio",
                    "choices": [0.00001, 0.0001, 0.001, 0.01, 0.1]
                }
            }
        }
    }
];