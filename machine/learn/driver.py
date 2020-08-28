"""This file is part of the PennAI library.

Copyright (C) 2017 Epistasis Lab, University of Pennsylvania

PennAI is maintained by:
    - Heather Williams (hwilli@upenn.edu)
    - Weixuan Fu (weixuanf@pennmedicine.upenn.edu)
    - William La Cava (lacava@upenn.edu)
    - and many other generous open source contributors

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

"""
from io_utils import Experiment, parse_args
from skl_utils import generate_results


def main(args, param_grid={}):
    """Main Driver for PennAI experiment.
    Parameters
    ----------
    args: dict
        arguments for PennAI experiment
    param_grid: dict
        If grid_search is non-empty dictionary, then the experiment will
        do parameter tuning via GridSearchCV. It should report best result to UI
        and save all results to knowlegde base.
    timeout: int
        maximum seconds for running the experiment

    Returns
    -------
    None

    """
    exp = Experiment(args)
    input_data, data_info = exp.get_input()
    model, method_type, encoding_strategy = exp.get_model()
    if not args['grid_search']:
        param_grid = {}
    if method_type != data_info["prediction_type"]:
        raise RuntimeError(
            "Experiment failed! "
            "Dataset type is {} "
            "but method type is {}".format(
                data_info["prediction_type"],
                method_type))
    generate_results(model=model,
                     input_data=input_data,
                     tmpdir=exp.tmpdir,
                     target_name=data_info['target_name'],
                     _id=args['_id'],
                     mode=method_type,
                     filename=data_info['filename'],
                     categories=data_info['categories'],
                     ordinals=data_info['ordinals'],
                     encoding_strategy=encoding_strategy,
                     param_grid=param_grid
                     )


if __name__ == "__main__":
    args, param_grid = parse_args()
    main(args, param_grid)
