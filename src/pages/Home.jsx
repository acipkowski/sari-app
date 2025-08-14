import React, { useState, useMemo } from "react";
import { Table } from "@nmfs-radfish/react-radfish";
import {
  Button,
  Form,
  FormGroup,
  Grid,
  GridContainer,
  Label,
  Select,
  Fieldset,
  Radio,
  Link,
} from "@trussworks/react-uswds";

// Hardcoded data from NEFSC SARI website
import myData from "./data.json";

// --- Helper function to generate unique, sorted options for our dropdowns ---
const getDropdownOptions = (data) => {
  const uniqueYears = [...new Set(data.map((item) => item.Year))];
  const uniqueSpecies = [...new Set(data.map((item) => item["Species Information"]))];
  const uniqueReviewProcesses = [...new Set(data.map((item) => item["Review Process"]))];

  uniqueYears.sort((a, b) => b - a); // Sort years descending
  uniqueSpecies.sort(); // Sort species alphabetically
  uniqueReviewProcesses.sort();

  return {
    years: uniqueYears,
    species: uniqueSpecies,
    reviewProcesses: uniqueReviewProcesses,
  };
};

const HomePage = () => {
  // STATE 1: Which view to show: the 'form' or the 'results' table
  const [view, setView] = useState("form");

  // STATE 2: The filtered data to be displayed in the table. Initially empty.
  const [filteredData, setFilteredData] = useState([]);

  // Default values for our form filters
  const initialFilterState = {
    speciesName: "All",
    startYear: "All",
    endYear: "All",
    reviewProcess: "All",
    status: "All",
    sortOrder: "Year", // Default sort
  };

  // STATE 3: An object to hold all the current values from the form
  const [filters, setFilters] = useState(initialFilterState);

  const formOptions = useMemo(() => getDropdownOptions(myData), []);

  // --- Event Handlers ---

  // A single handler for all form input changes
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prevFilters) => ({
      ...prevFilters, // Copy existing filters
      [name]: value, // Update the one that changed
    }));
  };

  // The main search/filter logic
  const handleSearchSubmit = (event) => {
    event.preventDefault(); // Prevent the browser from reloading the page

    // Start with the full dataset
    let results = [...myData];

    // Apply each filter conditionally
    if (filters.speciesName !== "All") {
      results = results.filter((item) => item["Species Information"] === filters.speciesName);
    }
    if (filters.reviewProcess !== "All") {
      results = results.filter((item) => item["Review Process"] === filters.reviewProcess);
    }
    if (filters.startYear !== "All") {
      results = results.filter((item) => item.Year >= filters.startYear);
    }
    if (filters.endYear !== "All") {
      results = results.filter((item) => item.Year <= filters.endYear);
    }
    if (filters.status !== "All") {
      results = results.filter((item) => item.Status === filters.status);
    }

    // Apply sorting
    if (filters.sortOrder === "Species") {
      results.sort((a, b) => a["Species Information"].localeCompare(b["Species Information"]));
    } else {
      // Default sort by Year descending
      results.sort((a, b) => b.Year - a.Year);
    }

    // Update the state with our final, filtered data
    setFilteredData(results);
    // Switch the view to show the results table
    setView("results");
  };

  const handleClearForm = () => {
    setFilters(initialFilterState);
  };

  const handleBackToSearch = () => {
    setView("form");
  };

  // STEP 2: Define the new columns array with our custom cell renderer
  const columns = useMemo(
    () => [
    { key: "Year", label: "Year" },
    { key: "Review Process", label: "Review Process" },
    { key: "Species Information", label: "Species Information" },
    { key: "Status", label: "Status" },
    {
      key: "documents",
      label: "Available Documents",
      render: (row) => {
        const links = [];
        // Check for each report type and create a link if the URL exists
        if (row["Assessment Summary"]) {
          links.push(
            <div key="summary">
              <Link 
                href={row["Assessment Summary"]} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Assessment Summary
              </Link>
            </div>
          );
        }
        if (row["Assessment Report"]) {
          links.push(
            <div key="report">
              <Link 
                href={row["Assessment Report"]} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Assessment Report
              </Link>
            </div>
          );
        }
        if (row["Panelist or Other Report"]) {
            links.push(
            <div key="panelist">
              <Link 
                href={row["Panelist or Other Report"]} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Panelist or Other Report
              </Link>
            </div>
          );
        }
        // If we found any links, render them. Otherwise, show a message.
        return links.length > 0 ? links : <span>None available</span>;
      },
    },
  ],
  []
  );

  // --- The Rendered JSX ---

  return (
    <GridContainer className="usa-section">
      {/* CONDITIONAL RENDERING: Show EITHER the form OR the results */}
      {view === "form" ? (
        // ------ THE SEARCH FORM VIEW ------
        <>
          <Form onSubmit={handleSearchSubmit} className="usa-form--large margin-x-auto">
          <h1>Search Stock Assessments</h1>
            <Grid row gap>
              {/* Species Name */}
              <Grid col={12} desktop={{ col: 6 }}>
                <FormGroup>
                  <Label htmlFor="speciesName">Species Name</Label>
                  <Select
                    id="speciesName"
                    name="speciesName"
                    value={filters.speciesName}
                    onChange={handleFilterChange}
                  >
                    <option value="All">All Species</option>
                    {formOptions.species.map((species) => (
                      <option key={species} value={species}>
                        {species}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
              </Grid>

              {/* Review Process */}
              <Grid col={12} desktop={{ col: 6 }}>
                <FormGroup>
                  <Label htmlFor="reviewProcess">Review Process</Label>
                  <Select
                    id="reviewProcess"
                    name="reviewProcess"
                    value={filters.reviewProcess}
                    onChange={handleFilterChange}
                  >
                    <option value="All">All Processes</option>
                    {formOptions.reviewProcesses.map((process) => (
                      <option key={process} value={process}>
                        {process}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
              </Grid>

              {/* Start Year & End Year */}
              <Grid col={6}>
                <FormGroup>
                  <Label htmlFor="startYear">Start Year</Label>
                  <Select id="startYear" name="startYear" value={filters.startYear} onChange={handleFilterChange}>
                    <option value="All">All Years</option>
                    {formOptions.years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
              </Grid>
              <Grid col={6}>
                <FormGroup>
                  <Label htmlFor="endYear">End Year</Label>
                  <Select id="endYear" name="endYear" value={filters.endYear} onChange={handleFilterChange}>
                    <option value="All">All Years</option>
                    {formOptions.years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
              </Grid>
            </Grid>
            <Grid row gap className="margin-top-4">

              {/* Status */}
              <Grid col={6}>
                <Fieldset legend="Status Type">
                  <Radio id="status-all" name="status" value="All" label="All" checked={filters.status === "All"} onChange={handleFilterChange} />
                  <Radio id="status-completed" name="status" value="Completed" label="Completed" checked={filters.status === "Completed"} onChange={handleFilterChange}/>
                  <Radio id="status-planned" name="status" value="Planned" label="Planned" checked={filters.status === "Planned"} onChange={handleFilterChange}/>
                </Fieldset>
              </Grid>
              
              {/* Sort Order */}
              <Grid col={6}>
                <Fieldset legend="Group Results By">
                    <Radio id="sort-year" name="sortOrder" value="Year" label="Descending Year" checked={filters.sortOrder === "Year"} onChange={handleFilterChange} />
                    <Radio id="sort-species" name="sortOrder" value="Species" label="Species Name (A-Z)" checked={filters.sortOrder === "Species"} onChange={handleFilterChange} />
                </Fieldset>
              </Grid>
            </Grid>

            {/* Action Buttons */}
			<div className="margin-top-4 text-center">
			  <Button type="submit">Search</Button>
			  <Button
				type="button"
				unstyled
				onClick={handleClearForm}
				className="margin-left-2"
			  >
				Clear Values
			  </Button>
            </div>
          </Form>
        </>
      ) : (
        // ------ THE RESULTS TABLE VIEW ------
        <>
          <div className="display-flex flex-justify flex-align-center">
             <h1>Search Results ({filteredData.length} found)</h1>
             <Button type="button" onClick={handleBackToSearch} secondary>
                Back to Search
             </Button>
          </div>
          <br />
          <Table data={filteredData} columns={columns} bordered striped/>
        </>
      )}
    </GridContainer>
  );
};

export default HomePage;