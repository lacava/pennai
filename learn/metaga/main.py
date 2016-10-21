#    This file is a part of metaGA.
#
import numpy as np
import time
from sr_deapgp import SymbReg
#from decorator import Mut_Ranges
from deap import base
from deap import creator
from deap import tools
from deap import algorithms

def metaga(func, args_type, args_range, args_mut_type= None, meta_gen = 10 , meta_pop_size = 100, random_state = 99, outlog = None):

    def argu_gen(args_type, args_range, spec = False, args_mut_type = None, old_arg = None):
        """
        This is a random arguments genrator
        #population_size,generations,crossover_rate,mutation_rate,tournsize for this example

        Parameters
        ----------
            args_type: a list of arguments' types
            args_range: a list of arguments' ranges
            spec: return control
            args_mut_type: mutation control (need work with 'spec') string type
                random: randomly generate a new argument (default)
                increase: randomly generate a new larger than old one (need work with old_arg)
                decrease: randomly generate a new lower than old one (need work with old_arg)
            old_arg: old argument
        Return
        ----------
            return *args is spec = False
            return one argument is spec > 0
        """
        if not spec:
            # return a tuple
            args_list = []
            for atype, arange in zip(args_type, args_range):
                if atype == "int":
                    args_list.append(np.random.randint(arange[0], arange[1]+1))
                elif atype == 'float':
                    args_list.append(arange[0]+ np.random.random() * (arange[1]-arange[0]))
                elif atype == "bool":
                    args_list.append(bool(np.random.randint(0, 2)))
            return tuple(args_list)
        else:
            # return one arg
            arg = None
            atype = args_type[spec - 1]
            arange = args_range[spec - 1]
            amuttype = args_mut_type[spec - 1]
            range_min = arange[0]
            range_max = arange[1]
            if amuttype == "increase":
                if old_arg == None:
                    print('Warning: Missing old_arg argument!')
                range_min = old_arg
            elif amuttype == 'decrease':
                if old_arg == None:
                    print('Warning: Missing old_arg argument!')
                range_max = old_arg

            if atype == "int":
                arg = np.random.randint(range_min, range_max + 1)
            elif atype == 'float':
                arg = range_min + np.random.random() * (range_max-range_min)
            elif atype == "bool":
                arg = bool(np.random.randint(0, 2))
            return arg


    ### This step need to FGlab to submit to differnt machines
    def Best_GP_Individual(individual):
        """
        Lower level GP
        As one individual in metaga
        Parameters
        ----------
        individual: DEAP individual
            A list of arguments

        """

        arg = tuple(individual)
        pop, log, hof2, df, dfh = func(*arg)
        return (hof2.keys[0].values[0]),

    def mut_args(individual, indpb, args_type, args_range, args_mut_type):
        """
        Perform a replacement mutation on Argumnet in an individual
        Make sure the mutated in the ranges of arguments
        Each argument is independent for mutation
        Parameters
        ----------
        individual: DEAP individual
            A list of arguments
        args_range:
            A list of arguments' ranges
        indpb:
            Independent probability for each attribute to be flipped.
        Returns
        ----------
            Returns the individual with one of the mutations applied to it
        """
        def if_mut(pb):
            if np.random.random() < pb:
                return True
            else:
                return False
        tmp_ind = individual
        for arg_idx in range(len(tmp_ind)):
            if if_mut(indpb):
                tmp_ind[arg_idx] = argu_gen(args_type, args_range, spec = arg_idx + 1, args_mut_type = args_mut_type, old_arg=tmp_ind[arg_idx])
        return tmp_ind,



    creator.create("FitnessMin", base.Fitness, weights=(-1.0, ))
    creator.create("Individual", list, fitness=creator.FitnessMin)

    toolbox = base.Toolbox()

    # need submit this to differnt machines
    # LowerGpIndividual is for generate one individual

    toolbox.register("args_gen", argu_gen, args_type, args_range)
    #toolbox.register("lower_gp", random.randint, 0, 1)

    # Structure initializers
    #                         define 'individual' to be an individual
    #                         consisting of 100 'attr_bool' elements ('genes')

    toolbox.register("individual", tools.initIterate, creator.Individual,
        toolbox.args_gen)

    # define the population to be a list of individuals
    toolbox.register("population", tools.initRepeat, list, toolbox.individual)

    # the goal ('fitness') function to return the best run's fitness

    #----------
    # Operator registration
    #----------
    # register the goal / fitness function
    toolbox.register("evaluate", Best_GP_Individual)

    # register the crossover operator in order
    toolbox.register("mate", tools.cxTwoPoint)

    # register a mutation operator with a probability to


    toolbox.register("mutate", mut_args, indpb = 0.05, args_type = args_type,  args_range= args_range, args_mut_type= args_mut_type)

    # operator for selecting individuals for breeding the next
    # generation: each individual of the current generation
    # is replaced by the 'fittest' (best) of three individuals
    # drawn randomly from the current generation.
    toolbox.register("select", tools.selTournament, tournsize=3)

    #----------

    np.random.seed(random_state)  # random seed in magaga

    # create an initial population of 300 individuals (where
    # each individual is a list of integers)
    pop = toolbox.population(n=meta_pop_size)

    # CXPB  is the probability with which two individuals
    #       are crossed
    #
    # MUTPB is the probability for mutating an individual
    #
    # NGEN  is the number of generations for which the
    #       evolution runs
    CXPB, MUTPB = 0.5, 0.2
    NGEN = meta_gen + 1

    print("Start of MetaGA")
        # Begin the evolution
    # Need to more curemazie
    if outlog:
        outf = open(outlog, 'w')
        # header of log table
        outf.write('#gen\tneval\tfitness_avg\tfitness_std\tfitness_max\tfitness_min')
        outf.write('\ttime_usage')
        #population_size,generations,crossover_rate,mutation_rate,tournsize,random_state]
        outf.write('\tbest_ind_population_size')
        outf.write('\tbest_ind_generations')
        outf.write('\tbest_ind_crossover_rate')
        outf.write('\tbest_ind_mutation_rate')
        outf.write('\tbest_ind_tournsize')
        outf.write('\n')

    for gen in range(NGEN):
        time_start = time.time()
        print("-- Generation %i --" % gen)

        # Select the next generation individuals
        offspring = toolbox.select(pop, len(pop))
        # Clone the selected individuals
        offspring = list(map(toolbox.clone, offspring))

        # Apply crossover and mutation on the offspring
        for child1, child2 in zip(offspring[::2], offspring[1::2]):

            # cross two individuals with probability CXPB
            if np.random.random() < CXPB:
                toolbox.mate(child1, child2)

                # fitness values of the children
                # must be recalculated later
                del child1.fitness.values
                del child2.fitness.values

        for mutant in offspring:

            # mutate an individual with probability MUTPB
            if np.random.random() < MUTPB:
                toolbox.mutate(mutant)
                del mutant.fitness.values

        # Evaluate the individuals with an invalid fitness
        invalid_ind = [ind for ind in offspring if not ind.fitness.valid]
        fitnesses = map(toolbox.evaluate, invalid_ind)
        for ind, fit in zip(invalid_ind, fitnesses):
            ind.fitness.values = fit
        neval = len(invalid_ind)
        print("  Evaluated %i individuals" % neval)

        # The population is entirely replaced by the offspring
        pop[:] = offspring

        # Gather all the fitnesses in one list and print the stats
        fits = [ind.fitness.values[0] for ind in pop]
        time_used = time.time() - time_start
        # best_ind in each genelation
        best_ind = tools.selBest(pop, 1)[0]
        print("Best individual is %s, %s " % (best_ind, best_ind.fitness.values))
        print("Fitness:")
        fits_arg = np.mean(fits)
        fits_std = np.std(fits)
        fits_max = np.max(fits)
        fits_min = np.min(fits)
        print("  Avg %s" % fits_arg)
        print("  Std %s" % fits_std)
        print("  Max %s" % fits_max)
        print("  Min %s" % fits_min)

        print("Time_usage: %s " % time_used)

        if outlog:
            outf.write('{}\t{}\t'.format(gen, neval))
            outf.write('{}\t{}\t{}\t{}'.format(fits_arg, fits_std, fits_max, fits_min))
            outf.write('\t{}'.format(time_used))
            #population_size,generations,crossover_rate,mutation_rate,tournsize,random_state]
            for best_arg in best_ind:
                outf.write('\t{}'.format(best_arg))
            outf.write('\n')


    print("-- End of MetaGA")

    best_ind = tools.selBest(pop, 1)[0]
    print("Best individual is %s, %s" % (best_ind, best_ind.fitness.values))

    """
    # short version0
    # hard to get detail from log
    meta_hof = tools.HallOfFame(1)
    stats = tools.Statistics(lambda ind: ind.fitness.values)
    stats.register("avg", np.mean)
    stats.register("std", np.std)
    stats.register("min", np.min)
    stats.register("max", np.max)
    pop, log = algorithms.eaSimple(pop, toolbox, cxpb=CXPB, mutpb=MUTPB, ngen=NGEN,
                               stats=stats, halloffame=meta_hof, verbose=True)
    best_ind = tools.selBest(pop, 1)[0]
    print("Best individual is %s, %s" % (best_ind, best_ind.fitness.values))
    """



if __name__ == "__main__":
    ## need meta_agument here
    ## meta_gen
    ## meta_pop_size
    # need get arguments type and arguments ranges from FGlab optimization page
    #args_list = [population_size,generations,crossover_rate,mutation_rate,tournsize,random_state]
    args_type = ["int", "int", "float", "float", "int"]
    args_range = [[5, 20], [5,20], [0.0, 1.0], [0.0, 1.0], [2, 5]]
    args_mut_type = ['increase', 'increase', 'random', 'random', 'random']

    metaga(SymbReg, args_type, args_range, args_mut_type, 10, 150, random_state = 64)
