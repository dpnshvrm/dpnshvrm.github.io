/**
 * Script to load publications and teaching data from text files
 */

// Function to load and parse publications from a text file
async function loadPublications() {
  try {
    const response = await fetch('data/publications.txt');
    if (!response.ok) {
      throw new Error('Failed to load publications file');
    }
    
    const text = await response.text();
    const publications = parsePublicationsFile(text);
    displayPublications(publications);
  } catch (error) {
    console.error('Error loading publications:', error);
    document.getElementById('prep').innerHTML = '<p>Error loading publications. Please check your publications.txt file.</p>';
  }
}

// Function to parse the publications text file
function parsePublicationsFile(text) {
  // Split the text by publication entries (assuming they're separated by blank lines)
  const entries = text.split(/\n\s*\n/);
  
  const publications = {
    inPreparation: [],
    submitted: [],
    published: []
  };
  
  entries.forEach(entry => {
    if (!entry.trim()) return; // Skip empty entries
    
    const lines = entry.trim().split('\n');
    const publication = {
      title: '',
      authors: '',
      journal: '',
      year: '',
      doi: '',
      arxiv: '',
      video: '',
      note: '',
      status: 'published' // Default status
    };
    
    // Parse each line of the entry
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('Title:')) {
        publication.title = trimmedLine.substring('Title:'.length).trim();
      } else if (trimmedLine.startsWith('Authors:')) {
        publication.authors = trimmedLine.substring('Authors:'.length).trim();
      } else if (trimmedLine.startsWith('Journal:')) {
        publication.journal = trimmedLine.substring('Journal:'.length).trim();
      } else if (trimmedLine.startsWith('Year:')) {
        publication.year = trimmedLine.substring('Year:'.length).trim();
      } else if (trimmedLine.startsWith('DOI:')) {
        publication.doi = trimmedLine.substring('DOI:'.length).trim();
      } else if (trimmedLine.startsWith('arXiv:')) {
        publication.arxiv = trimmedLine.substring('arXiv:'.length).trim();
      } else if (trimmedLine.startsWith('Video:')) {
        publication.video = trimmedLine.substring('Video:'.length).trim();
      } else if (trimmedLine.startsWith('Note:')) {
        publication.note = trimmedLine.substring('Note:'.length).trim();
      } else if (trimmedLine.startsWith('Status:')) {
        publication.status = trimmedLine.substring('Status:'.length).trim().toLowerCase();
      }
    });
    
    // Add to the appropriate category
    if (publication.status.includes('preparation') || publication.status.includes('prep')) {
      publications.inPreparation.push(publication);
    } else if (publication.status.includes('submitted') || publication.status.includes('submit')) {
      publications.submitted.push(publication);
    } else {
      publications.published.push(publication);
    }
  });
  
  return publications;
}

// Function to format author names and highlight your name
function formatAuthors(authorString) {
  if (!authorString) return '';
  
  // Replace your name with bold version
  return authorString.replace(/Deepanshu Verma/g, '<strong>Deepanshu Verma</strong>')
                    .replace(/D\. Verma/g, '<strong>D. Verma</strong>');
}

// Function to display publications on the page
function displayPublications(publications) {
  // In Preparation
  let prepHtml = '<ul class="publications-list">';
  publications.inPreparation.forEach(pub => {
    prepHtml += `
      <li class="publication-item">
        <div class="publication-title">${pub.title}</div>
        <div class="authors">${formatAuthors(pub.authors)}</div>
        ${pub.note ? `<div class="publication-meta">${pub.note}</div>` : ''}
      </li>
    `;
  });
  prepHtml += '</ul>';
  document.getElementById('prep').innerHTML = prepHtml;
  
  // Submitted
  let submittedHtml = '<ul class="publications-list">';
  publications.submitted.forEach(pub => {
    submittedHtml += `
      <li class="publication-item">
        <div class="publication-title">${pub.title}</div>
        <div class="authors">${formatAuthors(pub.authors)}</div>
        ${pub.journal ? `<div class="publication-meta">Submitted to <i>${pub.journal}</i></div>` : ''}
        <div class="publication-links">
          ${pub.arxiv ? `<a href="${pub.arxiv}" target="_blank"><i class="fas fa-file-pdf"></i> arXiv</a>` : ''}
        </div>
      </li>
    `;
  });
  submittedHtml += '</ul>';
  document.getElementById('submitted').innerHTML = submittedHtml;
  
  // Published
  let publishedHtml = '<ul class="publications-list">';
  publications.published.forEach(pub => {
    publishedHtml += `
      <li class="publication-item">
        <div class="publication-title">${pub.title}</div>
        <div class="authors">${formatAuthors(pub.authors)}</div>
        <div class="publication-meta">
          ${pub.journal ? `<i>${pub.journal}</i>` : ''}
          ${pub.year ? ` (${pub.year})` : ''}
        </div>
        <div class="publication-links">
          ${pub.doi ? `<a href="https://doi.org/${pub.doi}" target="_blank"><i class="fas fa-external-link-alt"></i> DOI</a>` : ''}
          ${pub.arxiv ? `<a href="${pub.arxiv}" target="_blank"><i class="fas fa-file-pdf"></i> arXiv</a>` : ''}
          ${pub.video ? `<a href="${pub.video}" target="_blank"><i class="fas fa-video"></i> Video</a>` : ''}
        </div>
      </li>
    `;
  });
  publishedHtml += '</ul>';
  document.getElementById('published').innerHTML = publishedHtml;
}

// Function to load teaching data from a text file
async function loadTeaching() {
  try {
    const response = await fetch('data/teaching.txt');
    if (!response.ok) {
      throw new Error('Failed to load teaching file');
    }
    
    const text = await response.text();
    const courses = parseTeachingFile(text);
    displayTeaching(courses);
  } catch (error) {
    console.error('Error loading teaching data:', error);
    document.querySelector('#teaching table tbody').innerHTML = '<tr><td colspan="4">Error loading teaching data. Please check your teaching.txt file.</td></tr>';
  }
}

// Function to parse the teaching text file
function parseTeachingFile(text) {
  // Split the text by course entries (assuming they're separated by blank lines)
  const entries = text.split(/\n\s*\n/);
  const courses = [];
  
  entries.forEach(entry => {
    if (!entry.trim()) return; // Skip empty entries
    
    const lines = entry.trim().split('\n');
    const course = {
      term: '',
      name: '',
      role: '',
      institution: ''
    };
    
    // Parse each line of the entry
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('Term:')) {
        course.term = trimmedLine.substring('Term:'.length).trim();
      } else if (trimmedLine.startsWith('Course:')) {
        course.name = trimmedLine.substring('Course:'.length).trim();
      } else if (trimmedLine.startsWith('Role:')) {
        course.role = trimmedLine.substring('Role:'.length).trim();
      } else if (trimmedLine.startsWith('Institution:')) {
        course.institution = trimmedLine.substring('Institution:'.length).trim();
      }
    });
    
    // Add to courses array if it has required fields
    if (course.term && course.name) {
      courses.push(course);
    }
  });
  
  // Sort by term, assuming format like "Fall 2023" or "Spring 2022"
  courses.sort((a, b) => {
    const termA = a.term.split(' ');
    const termB = b.term.split(' ');
    
    // Compare years first
    const yearA = parseInt(termA[1]);
    const yearB = parseInt(termB[1]);
    
    if (yearB !== yearA) {
      return yearB - yearA; // Descending order by year
    }
    
    // Same year, compare semester
    const semesterOrder = { 'Spring': 1, 'Summer': 2, 'Fall': 3, 'Winter': 4 };
    return semesterOrder[termB[0]] - semesterOrder[termA[0]];
  });
  
  return courses;
}

// Function to display teaching data on the page
function displayTeaching(courses) {
  let tableHtml = '';
  
  courses.forEach(course => {
    tableHtml += `
      <tr>
        <td>${course.term}</td>
        <td>${course.name}</td>
        <td>${course.role || 'Primary Instructor'}</td>
        <td>${course.institution}</td>
      </tr>
    `;
  });
  
  document.querySelector('#teaching table tbody').innerHTML = tableHtml;
}

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', () => {
  loadPublications();
  loadTeaching();
});
